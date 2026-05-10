/**
 * /api/contact — Route Handler that receives POSTs from the contact form.
 *
 * What's a Route Handler?
 *  - In the App Router, a file named `route.ts` (or `.js`) at any path under
 *    `src/app/...` becomes an HTTP endpoint at that URL. This file lives at
 *    `src/app/api/contact/route.ts` → URL `/api/contact`.
 *  - You export `async` functions named after HTTP methods (GET, POST, PUT,
 *    PATCH, DELETE, HEAD, OPTIONS). Anything not exported returns 405.
 *  - This is the App Router replacement for the old Pages-router `pages/api/`
 *    convention. There can't be a `route.ts` at the same path as a `page.tsx`
 *    — they'd both try to claim the same URL.
 *  - Docs: node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
 *
 * How is it different from a Page?
 *  - A Page returns JSX (React tree → HTML). A Route Handler returns a
 *    Web `Response` (raw HTTP — JSON, text, blobs, redirects).
 *  - Pages can be Server or Client. Route Handlers are SERVER-ONLY. They
 *    never ship to the browser.
 *
 * Why server-only matters:
 *  - Server-only code can read environment variables (`process.env.X`) and
 *    talk to private services (databases, SMTP, paid APIs) safely. Putting
 *    those calls in a Client Component would leak the secrets into the
 *    JS bundle that anyone can view.
 *
 * Web standards, not Express:
 *  - The `request` parameter is a standard Web `Request`
 *    (https://developer.mozilla.org/docs/Web/API/Request) — same shape you'd
 *    use in a Service Worker or Cloudflare Worker. No `req.body`, no
 *    `req.params` — instead `await request.json()`, `request.headers.get(...)`,
 *    `new URL(request.url).searchParams.get(...)`.
 *  - The return value is a Web `Response`. `Response.json(value, init)` is
 *    a static helper that sets `Content-Type: application/json` and
 *    serializes the body for you.
 *
 * Production note:
 *  - We `console.log` the message for now so the owner can see it in the
 *    server terminal during dev. To actually deliver email, swap the log
 *    for an SMTP / API call (Resend, SendGrid, AWS SES, Postmark, Brevo,
 *    Mailgun…). Read the API key from `process.env.X` — never hardcode it.
 *
 * TS / runtime concepts demonstrated:
 *  - `unknown` as the safe parse target (vs. `any`).
 *  - In-memory `Map<string, number>` for trivial rate limiting.
 *  - Discriminated-style early-return validation chain.
 */

// Tell Next this route is dynamic — it always runs at request time, never
// prerendered. We touch `request.headers`, which would force this anyway,
// but stating it is more explicit and avoids surprises.
export const dynamic = "force-dynamic";

/**
 * Shape of the JSON body we expect from the client form.
 * All fields are typed as optional + unknown because clients can send
 * anything; we validate before trusting them.
 */
type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

/**
 * Cooldown table: IP → epoch milliseconds of last accepted POST.
 *
 * `Map<K, V>` is a generic class — type the key/value once and TS infers
 * `.get()`/`.set()` correctly. We store the timestamp as `number`.
 *
 * Limits:
 *  - In-memory state is per-process; serverless platforms (Vercel) spin up
 *    multiple isolated instances, so this is "best effort" — fine for a
 *    portfolio. For real production, use Redis / Upstash / Vercel KV.
 *  - The Map grows forever in long-lived servers. We keep it small with a
 *    cleanup pass on every request (cheap when entries are few).
 */
const lastSubmitByIp = new Map<string, number>();
const COOLDOWN_MS = 5_000; // 5 seconds between submissions per IP.
const MAX_TRACKED_IPS = 1_000;

/**
 * Returns true if `value` is a non-empty string after trimming.
 *
 * `value is string` is a TYPE PREDICATE — when it returns true, TS narrows
 * the variable to `string` at the call site. That's why we can call
 * `.trim()` on `payload.name` after `isNonEmptyString(payload.name)` even
 * though it started as `unknown`.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Lightweight email shape check. Not RFC-perfect — that's intentional.
 * Real validation = "send a code and see if they receive it". This catches
 * obvious mistakes (no @, no domain) without blocking legitimate addresses.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request): Promise<Response> {
  // ---------- 1. Identify caller for rate limiting ----------
  // `x-forwarded-for` is the standard header for "real client IP" when a
  // proxy / load balancer / CDN sits in front. The first comma-separated
  // entry is the original client; the rest are intermediate hops.
  // Fall back to "unknown" so we still rate-limit (just shared bucket).
  const xff = request.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || "unknown";

  const now = Date.now();
  const last = lastSubmitByIp.get(ip);
  if (last !== undefined && now - last < COOLDOWN_MS) {
    // 429 = Too Many Requests. The standard status for rate limits.
    return Response.json(
      { error: "You're sending messages too quickly. Try again in a moment." },
      { status: 429 },
    );
  }

  // ---------- 2. Parse body safely ----------
  // `await request.json()` returns `any` (Web spec). Cast to our `unknown`-
  // typed shape so we're forced to validate before reading.
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return Response.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { name, email, subject, message } = payload;

  // ---------- 3. Validate required fields ----------
  if (!isNonEmptyString(name) || name.trim().length > 200) {
    return Response.json(
      { error: "Please provide a valid name." },
      { status: 400 },
    );
  }
  if (!isNonEmptyString(email) || !EMAIL_REGEX.test(email.trim())) {
    return Response.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }
  if (!isNonEmptyString(message) || message.trim().length < 5) {
    return Response.json(
      { error: "Message is too short." },
      { status: 400 },
    );
  }
  if (message.trim().length > 5_000) {
    return Response.json(
      { error: "Message is too long." },
      { status: 400 },
    );
  }
  // `subject` is optional — only enforce length if present.
  if (typeof subject === "string" && subject.length > 200) {
    return Response.json(
      { error: "Subject is too long." },
      { status: 400 },
    );
  }

  // ---------- 4. "Deliver" the message ----------
  // For now: log to the server console. The owner runs `next dev` and sees
  // this in the terminal. To actually email it, replace the log with a call
  // like:
  //
  //   await resend.emails.send({
  //     from: "Portfolio <noreply@yourdomain>",
  //     to: process.env.CONTACT_TO!,
  //     replyTo: email,
  //     subject: subject ?? `New contact from ${name}`,
  //     text: message,
  //   });
  //
  // Read API keys from `process.env`, never hardcode.
  console.log("[/api/contact] new message", {
    ip,
    name: name.trim(),
    email: email.trim(),
    subject: typeof subject === "string" ? subject.trim() : undefined,
    message: message.trim(),
    receivedAt: new Date(now).toISOString(),
  });

  // ---------- 5. Record the rate-limit timestamp ----------
  lastSubmitByIp.set(ip, now);

  // Cheap cleanup so the Map can't grow without bound. If we cross the
  // tracking cap, drop entries older than the cooldown window — they no
  // longer affect future requests.
  if (lastSubmitByIp.size > MAX_TRACKED_IPS) {
    for (const [key, ts] of lastSubmitByIp) {
      if (now - ts > COOLDOWN_MS) lastSubmitByIp.delete(key);
    }
  }

  // ---------- 6. Done ----------
  return Response.json({ ok: true }, { status: 200 });
}

/**
 * /api/contact — Route Handler that receives POSTs from the contact form.
 *
 * What's a Route Handler?
 *  - In the App Router, a file named `route.ts` (or `.js`) at any path under
 *    `src/app/...` becomes an HTTP endpoint at that URL. This file lives at
 *    `src/app/api/contact/route.ts` → URL `/api/contact`.
 *  - You export `async` functions named after HTTP methods (GET, POST, PUT,
 *    PATCH, DELETE, HEAD, OPTIONS). Anything not exported returns 405.
 *  - Docs: node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
 *
 * Server-only:
 *  - Route Handlers never ship to the browser. They can read environment
 *    variables (`process.env.X`) and call private APIs (Resend, databases…)
 *    without leaking secrets into the JS bundle.
 *
 * Web standards, not Express:
 *  - `request` is a Web `Request` (MDN: /Web/API/Request). Use
 *    `await request.json()`, `request.headers.get(...)`.
 *  - We return a Web `Response`. `Response.json(value, init)` sets
 *    `Content-Type: application/json` and serializes for us.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * ENVIRONMENT VARIABLES (set in `.env.local` for dev, in Vercel for prod)
 * ──────────────────────────────────────────────────────────────────────────
 *  - RESEND_API_KEY  — your Resend API key. Get it from https://resend.com.
 *                      Format: `re_xxxxxxxxxxxxxxxxxxxxxxxx`. If MISSING,
 *                      the route still returns ok:true (graceful local-dev
 *                      degrade) but logs a warning so you know nothing went
 *                      out.
 *  - CONTACT_TO      — destination email address (where YOU receive the
 *                      inbound contact). Usually your owner email.
 *  - CONTACT_FROM    — (optional) verified sender address registered with
 *                      Resend. Defaults to `Portfolio <onboarding@resend.dev>`
 *                      so things work in dev with a sandbox sender. In
 *                      production, register your own domain and switch this
 *                      to e.g. `Portfolio <noreply@m3m3development.com>`.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Why raw `fetch` instead of `npm i resend`?
 *  - Zero new dependencies → smaller bundle, fewer supply-chain surfaces, and
 *    the Resend HTTP API is dead simple (one POST). The SDK adds nothing we
 *    can't do in 5 lines of fetch.
 *
 * TS / runtime concepts demonstrated:
 *  - `unknown` as the safe parse target (vs. `any`).
 *  - In-memory `Map<string, number>` for trivial rate limiting.
 *  - Discriminated-style early-return validation chain.
 *  - Honeypot + time-trap bot deterrents (silent reject pattern).
 */

// Tell Next this route is dynamic — it always runs at request time, never
// prerendered. We touch `request.headers`, which would force this anyway,
// but stating it is more explicit and avoids surprises.
export const dynamic = "force-dynamic";

/**
 * Shape of the JSON body we expect from the client form.
 * All fields are typed as `unknown` because clients can send anything; we
 * validate before trusting them.
 *
 *  - `company` is the HONEYPOT. Real users never see / fill it (it's
 *    visually hidden + has tabIndex={-1}). Bots that auto-fill every input
 *    will fill it → we silent-reject.
 *  - `_t` is a CLIENT-SIDE TIMESTAMP captured when the form mounted. If the
 *    submission arrives suspiciously fast after mount (< 1500ms), it's
 *    almost certainly a bot — silent reject.
 */
type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  company?: unknown; // honeypot
  _t?: unknown; // mount timestamp (epoch ms)
};

/**
 * Cooldown table: IP → epoch milliseconds of last accepted POST.
 *
 * `Map<K, V>` is a generic class — type the key/value once and TS infers
 * `.get()`/`.set()` correctly. We store the timestamp as `number`.
 *
 * Limits: in-memory state is per-process; serverless platforms (Vercel) spin
 * up multiple isolated instances, so this is "best effort" — fine for a
 * portfolio. For real production, use Redis / Upstash / Vercel KV.
 */
const lastSubmitByIp = new Map<string, number>();
const COOLDOWN_MS = 5_000; // 5 seconds between submissions per IP.
const MAX_TRACKED_IPS = 1_000;

/**
 * Minimum time the form must be visible before submission is accepted.
 * Real humans take >1.5s to fill a form. Bots auto-submit instantly.
 */
const MIN_RENDER_TIME_MS = 1_500;

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

/**
 * Tiny HTML escaper. We embed user-supplied strings (name, subject, message)
 * inside the email body's HTML, so we MUST escape `<`, `>`, `&`, `"`, `'`
 * to prevent the values from being interpreted as markup.
 *
 * This is the same defence as React's auto-escaping on text children — only
 * here we're the ones building the HTML, so we have to do it ourselves.
 */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Send one email via the Resend HTTP API.
 *
 * Why a helper?
 *  - We send TWO emails per submission (inbound to owner + auto-reply to
 *    sender). DRY — one helper, two calls.
 *
 * Throws on non-2xx so the caller can `try/catch` per-email and decide
 * whether to keep going.
 */
async function sendResendEmail(args: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const { apiKey, from, to, subject, html, replyTo } = args;

  // The Resend HTTP API:
  //   POST https://api.resend.com/emails
  //   Authorization: Bearer <RESEND_API_KEY>
  //   { from, to, subject, html, reply_to? }
  // Docs: https://resend.com/docs/api-reference/emails/send-email
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      // Resend's API field is `reply_to` (snake_case). Only include when set.
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    // Try to surface the JSON error body Resend returns (e.g. invalid sender).
    const errBody = await res.text().catch(() => "");
    throw new Error(
      `Resend send failed: ${res.status} ${res.statusText} ${errBody}`,
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  // ---------- 1. Identify caller for rate limiting ----------
  // `x-forwarded-for` is the standard header for "real client IP" when a
  // proxy / load balancer / CDN sits in front. The first comma-separated
  // entry is the original client; the rest are intermediate hops.
  const xff = request.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || "unknown";

  const now = Date.now();
  const last = lastSubmitByIp.get(ip);
  if (last !== undefined && now - last < COOLDOWN_MS) {
    // 429 = Too Many Requests. The client maps this to a friendly
    // "wait 5 seconds" toast.
    return Response.json(
      { error: "You're sending messages too quickly. Try again in a moment." },
      { status: 429 },
    );
  }

  // ---------- 2. Parse body safely ----------
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, email, subject, message, company, _t } = payload;

  // ---------- 3. Bot deterrents (silent reject pattern) ----------
  // The convention: when we DETECT a bot, we return 200 ok:true. Why? If we
  // returned 4xx, the bot's operator could iterate until it found values
  // that pass. Returning ok:true makes the bot think it succeeded and move
  // on — wasting their time, not ours.

  // 3a. Honeypot — `company` is hidden from real users via CSS + tabIndex=-1.
  if (typeof company === "string" && company.trim().length > 0) {
    console.warn("[/api/contact] honeypot tripped from", ip);
    return Response.json({ ok: true }, { status: 200 });
  }

  // 3b. Time trap — submissions faster than MIN_RENDER_TIME_MS are bots.
  // `_t` is the millisecond epoch captured when the form mounted in the
  // browser. We compare it to `now` server-side. If the client lies and
  // sends an old `_t`, that's fine — we still rate-limit by IP.
  if (typeof _t === "number" && Number.isFinite(_t)) {
    const elapsed = now - _t;
    // Negative `elapsed` means the client clock is ahead — don't trust it
    // as evidence of a bot, just skip the check.
    if (elapsed >= 0 && elapsed < MIN_RENDER_TIME_MS) {
      console.warn(
        `[/api/contact] time-trap tripped from ${ip} (elapsed=${elapsed}ms)`,
      );
      return Response.json({ ok: true }, { status: 200 });
    }
  }

  // ---------- 4. Validate required fields ----------
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
  if (!isNonEmptyString(message) || message.trim().length < 10) {
    return Response.json(
      { error: "Message is too short (10+ characters please)." },
      { status: 400 },
    );
  }
  if (message.trim().length > 4_000) {
    return Response.json(
      { error: "Message is too long (max 4000 characters)." },
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

  // ---------- 5. Deliver via Resend ----------
  // From this point on, all string fields are trimmed + validated.
  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanSubject =
    typeof subject === "string" && subject.trim().length > 0
      ? subject.trim()
      : `New contact from ${cleanName}`;
  const cleanMessage = message.trim();

  const apiKey = process.env.RESEND_API_KEY;
  const contactTo = process.env.CONTACT_TO;
  // Resend's sandbox sender works without a verified domain — handy for
  // local dev. In production, set CONTACT_FROM to your verified address.
  const contactFrom =
    process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>";

  if (!apiKey || !contactTo) {
    // Graceful degrade — log loudly so the dev knows, but DON'T fail the
    // request. The form still feels like it works in local dev without keys.
    console.warn(
      "[/api/contact] RESEND_API_KEY or CONTACT_TO is missing — email NOT sent.",
      "Set them in .env.local. Submission was:",
      {
        ip,
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
      },
    );
  } else {
    // Build the inbound email (to owner). Plain HTML — keep it simple.
    // We `escapeHtml` every user-supplied value (name/subject/email/message).
    const inboundHtml = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;">
        <h2 style="margin:0 0 12px;">New portfolio contact</h2>
        <p style="margin:0 0 4px;"><strong>From:</strong> ${escapeHtml(cleanName)} &lt;${escapeHtml(cleanEmail)}&gt;</p>
        <p style="margin:0 0 16px;"><strong>Subject:</strong> ${escapeHtml(cleanSubject)}</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
        <pre style="white-space:pre-wrap;font-family:inherit;margin:0;">${escapeHtml(cleanMessage)}</pre>
        <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
        <p style="font-size:12px;color:#666;margin:0;">Sent from /contact · IP ${escapeHtml(ip)} · ${new Date(now).toISOString()}</p>
      </div>
    `;

    // Auto-reply (to sender) — sets expectations without you doing anything.
    const replyHtml = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;">
        <p>Hi ${escapeHtml(cleanName.split(/\s+/)[0] ?? "there")},</p>
        <p>Thanks for reaching out — I got your message and will reply within 24 hours.</p>
        <p style="margin:16px 0;padding:12px;border-left:3px solid #00b5c4;background:#f6fcfd;color:#333;font-style:italic;">
          ${escapeHtml(cleanMessage).replace(/\n/g, "<br/>")}
        </p>
        <p>If it's urgent, you can also reach me by phone or LinkedIn.</p>
        <p>— Shamar</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
        <p style="font-size:12px;color:#666;margin:0;">This is an automated confirmation. Please don't reply to this address; I'll respond from my personal email.</p>
      </div>
    `;

    // Two independent try/catch blocks: an auto-reply failure shouldn't
    // mask a successful inbound delivery (and vice versa). We log on either
    // failure but still return ok to the user — they don't care about the
    // mechanics, only that their message reached you.
    try {
      await sendResendEmail({
        apiKey,
        from: contactFrom,
        to: contactTo,
        subject: `[Portfolio] ${cleanSubject}`,
        html: inboundHtml,
        replyTo: cleanEmail,
      });
    } catch (err) {
      console.error("[/api/contact] inbound email failed:", err);
    }

    try {
      await sendResendEmail({
        apiKey,
        from: contactFrom,
        to: cleanEmail,
        subject: "Got your message — replying within 24h",
        html: replyHtml,
      });
    } catch (err) {
      console.error("[/api/contact] auto-reply failed:", err);
    }
  }

  // ---------- 6. Record the rate-limit timestamp ----------
  lastSubmitByIp.set(ip, now);

  // Cheap cleanup so the Map can't grow without bound.
  if (lastSubmitByIp.size > MAX_TRACKED_IPS) {
    for (const [key, ts] of lastSubmitByIp) {
      if (now - ts > COOLDOWN_MS) lastSubmitByIp.delete(key);
    }
  }

  // ---------- 7. Done ----------
  return Response.json({ ok: true }, { status: 200 });
}

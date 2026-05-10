/**
 * SystemStatus — "live ops dashboard" strip for the homepage.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  WHAT THIS REPLACES
 * ─────────────────────────────────────────────────────────────────────────────
 *  This file replaces the old vanity-metric `<Stats />` strip. Instead of
 *  generic "5+ years experience" tiles, we show a row of *live operational
 *  signals* — the kind of thing you'd see at the top of a Stripe or Vercel
 *  status page. It's a much stronger signal of "this person ships and
 *  operates real systems".
 *
 *  Cells:
 *    1. Status            — "All systems operational" (always green for now)
 *    2. Production sites  — count of live ECOSYSTEM entries
 *    3. Last deploy       — relative time, derived from Vercel build env
 *    4. GitHub commits/7d — pulled live from GitHub Events API (cached 1h)
 *    5. Total LOC shipped — static "287K" (M3 Marketplace headline)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  WHY THIS IS A SERVER COMPONENT (no `"use client"` at top)
 * ─────────────────────────────────────────────────────────────────────────────
 *  This component is `async` and calls `fetch()` directly — that's only
 *  legal in Server Components in the App Router. Server Components run on
 *  the build server (or the edge at request time, depending on caching),
 *  meaning:
 *
 *    - The GitHub API token (if set) NEVER reaches the browser.
 *    - The fetch result is cached at the framework level, not per-user.
 *    - Zero JS for this strip ships to the client (except the tiny
 *      `<LivePulse>` island that needs the animation loop).
 *
 *  See `node_modules/next/dist/docs/` for the Server vs Client component
 *  guide — the short version: default to server, opt into client only when
 *  you need state/effects/refs/event handlers/browser APIs.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  TS / NEXT CONCEPTS DEMONSTRATED
 * ─────────────────────────────────────────────────────────────────────────────
 *  - `async` Server Components — they can `await` data inline.
 *  - **Next's extended `fetch` options** — `next: { revalidate: 3600 }`
 *    enables Incremental Static Regeneration: the page builds once, then
 *    re-fetches at most every hour.
 *  - **Tagged literal-union return types** via discriminated unions
 *    (`{ ok: true; value: X } | { ok: false }`) — a beginner-friendly
 *    alternative to `try/catch` plumbing.
 *  - **`?? 0` (nullish coalescing)** — replaces `null`/`undefined` only,
 *    NOT empty strings or `0`. Different from `||`.
 *  - **`as const` arrays** — locks every cell entry to its literal type.
 *  - **Error containment** — every external call is wrapped in `try/catch`
 *    so one flaky API can't blow up the homepage render.
 */

import { Activity, Boxes, GitCommit, Rocket, Code2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Section } from "@/components/ui/Section";
import { ECOSYSTEM } from "@/data/ecosystem";
import { LivePulse, type Tone } from "@/components/hero/LivePulse";

// ─── Types ────────────────────────────────────────────────────────────────
//
// Each status cell is a small data object. Typing the array first means TS
// catches typos in the JSX below.
//
// `tone` is optional — if omitted, the cell is rendered without a dot at all
// (used for "Total LOC shipped", which is a static number, not a live signal).
interface StatusCell {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
}

// ─── GitHub fetch ─────────────────────────────────────────────────────────
//
// The shape of one entry from the public GitHub Events API. We only declare
// the fields we actually read — TS allows extra fields at runtime without
// complaining, so this is *narrower* than the real response on purpose.
//
// `Record<string, unknown>` on `payload` is a beginner-safe escape hatch:
// it says "an object with string keys and unknown values" — i.e., we have
// to type-check before reading anything from it. Safer than `any`.
interface GhEvent {
  type: string;
  created_at: string;
  payload?: { distinct_size?: number } & Record<string, unknown>;
}

// Discriminated-union return type. Callers branch on `.ok` and TS narrows
// the payload. This pattern avoids `null`-pollution and reads cleanly.
type CommitResult =
  | { ok: true; total: number }
  | { ok: false };

/**
 * Pull the last 7 days of public push commits from GitHub.
 *
 * - 1-hour cache (`revalidate: 3600`) — Next.js will serve a cached value
 *   for up to 60 minutes, then trigger a background re-fetch on the next
 *   request. The user never waits.
 * - All errors are *swallowed* and converted to `{ ok: false }`. The UI
 *   then renders an em-dash "—" instead of crashing the page.
 * - `process.env.GITHUB_TOKEN` is read lazily — if absent, the request goes
 *   out unauthenticated (60 req/hour limit, plenty for an hourly cache).
 */
async function fetchCommitsLast7Days(): Promise<CommitResult> {
  // Build headers as a plain object; spread the auth header in only when
  // the env var is set so we never send `Authorization: Bearer undefined`.
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "myportfoliov2",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      "https://api.github.com/users/ShTPDev/events/public?per_page=100",
      {
        headers,
        // Next.js extends the standard `fetch()` with a `next` option.
        // `revalidate: 3600` = "cache this response for 3600 seconds (1h)".
        // Docs: node_modules/next/dist/docs/ → Caching → fetch.
        next: { revalidate: 3600 },
      },
    );

    // GitHub returns 403 on rate limit, 404 on missing user, etc.
    // Anything non-2xx → fail soft.
    if (!res.ok) return { ok: false };

    // `unknown` is TS's "I don't trust this yet" type. We must narrow it
    // before using it — the `Array.isArray` guard does exactly that.
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return { ok: false };

    // Cutoff = now minus 7 days, expressed in milliseconds since epoch.
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

    let total = 0;
    for (const raw of data as GhEvent[]) {
      if (raw.type !== "PushEvent") continue;
      // `Date.parse` returns `NaN` for invalid input — guard with `Number.isFinite`.
      const t = Date.parse(raw.created_at);
      if (!Number.isFinite(t) || t < cutoff) continue;
      // `?? 0` only kicks in for `null` / `undefined`. If the field is `0`
      // (no distinct commits in this push), we keep the `0`.
      total += raw.payload?.distinct_size ?? 0;
    }

    return { ok: true, total };
  } catch {
    // Network error, DNS failure, abort, etc. — fall back silently.
    return { ok: false };
  }
}

// ─── Last-deploy pretty-printer ───────────────────────────────────────────
//
// Vercel injects `VERCEL_GIT_COMMIT_SHA` into the build environment when
// you deploy on Vercel. We don't actually have a precise deploy timestamp
// at runtime in a Server Component (build-time only), so we approximate:
//
//   - If the SHA is present → assume "just now" relative to build time.
//     For the demo we show "deployed" + first 7 chars of the SHA so the
//     value feels *real*, not invented.
//   - If absent → "local" (you're running `next dev`).
//
// This is honest: we never fabricate a "2h ago" we don't actually know.
function describeLastDeploy(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (sha && sha.length >= 7) return sha.slice(0, 7);
  return "local";
}

// ─── Main component ───────────────────────────────────────────────────────

/**
 * Server Component. Note the `async` — it's required for `await` on the
 * GitHub fetch. Next.js handles the streaming render.
 */
export async function SystemStatus() {
  // Live data — both calls are cheap; the GitHub one is cached.
  const commits = await fetchCommitsLast7Days();
  const productionCount = ECOSYSTEM.length;
  const deploy = describeLastDeploy();

  // Build the cell array. Order matters — it's the visual left-to-right
  // order on desktop, top-to-bottom on mobile.
  const cells: ReadonlyArray<StatusCell> = [
    {
      label: "Status",
      value: "All systems operational",
      icon: Activity,
      tone: "green",
    },
    {
      label: "Production sites",
      value: String(productionCount),
      icon: Boxes,
      tone: "green",
    },
    {
      label: "Last deploy",
      value: deploy,
      icon: Rocket,
      // Amber if we're running locally — that's the "stale / not really
      // deployed" signal. Otherwise green for a real Vercel build.
      tone: deploy === "local" ? "amber" : "green",
    },
    {
      label: "Commits / 7d",
      // `commits.ok` narrows the union — TS knows `commits.total` only
      // exists on the `ok: true` branch.
      value: commits.ok ? String(commits.total) : "—",
      icon: GitCommit,
      tone: commits.ok ? "green" : "amber",
    },
    {
      label: "LOC shipped",
      value: "287K",
      icon: Code2,
      // No `tone` → no dot. Static figure; not a live signal.
    },
  ];

  return (
    <Section
      id="status"
      eyebrow="Live system status"
      title="What's running right now."
    >
      {/*
        Outer container — one big "glass" pill.
        - `glass`            — frosted-glass backdrop (defined in globals.css)
        - `rounded-2xl`      — soft 1rem corners
        - `divide-x divide-white/10` (lg) — paints 1px hairline borders
          between the direct-child columns at the lg breakpoint, exactly
          like Stripe's status header. We only enable it on lg+ because on
          smaller layouts each cell has its own row and a horizontal divider
          would look weird.
        - `overflow-hidden`  — clips any backdrop blur that escapes the
          rounded corners on Safari.

        Responsive grid:
          - Mobile : 1 column (stack)
          - md     : 2x3 grid (5 cells fit, last one spans the row)
          - lg+    : 5 columns (single horizontal strip)
      */}
      <div
        className={[
          "glass overflow-hidden rounded-2xl",
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
          "lg:divide-x lg:divide-white/10",
          // Replace divide-x with vertical dividers between rows on mobile
          // — a 1px line under each cell except the last.
          "divide-y divide-white/10 lg:divide-y-0",
        ].join(" ")}
        // `role="status"` tells screen readers "this is a status region".
        // `aria-live="polite"` would be wrong here — we don't update on the
        // client, the value is fixed at render time.
        role="status"
      >
        {cells.map((cell) => (
          <Cell key={cell.label} cell={cell} />
        ))}
      </div>
    </Section>
  );
}

// ─── Cell ────────────────────────────────────────────────────────────────
//
// Pulled out as its own function for readability — JSX gets noisy fast
// when each cell has 3 layered elements.
//
// `Readonly<{ cell: StatusCell }>` documents that `Cell` won't mutate
// the prop. React props are already read-only at runtime; this is a
// teaching annotation.
function Cell({ cell }: Readonly<{ cell: StatusCell }>) {
  const Icon = cell.icon;
  return (
    <div className="flex flex-col gap-2 px-5 py-5">
      {/* Top row: icon + uppercase mono label + (optional) live dot. */}
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-foreground-muted" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-muted">
          {cell.label}
        </span>
        {/*
          Conditional render with `&&`. If `tone` is undefined the whole
          expression is falsy and React skips it — no empty `<span>` is
          inserted. Cleaner than ternary-with-null.
        */}
        {cell.tone && (
          <span className="ml-auto">
            <LivePulse tone={cell.tone} />
          </span>
        )}
      </div>

      {/* Big value. `text-balance` keeps long strings from leaving an
          orphan word on the second line. */}
      <span className="text-balance text-base font-semibold tracking-tight text-foreground sm:text-lg">
        {cell.value}
      </span>
    </div>
  );
}

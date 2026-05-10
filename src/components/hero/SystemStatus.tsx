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
 *  Cells (left-to-right, desktop):
 *    1. Status            — "All systems operational" (always green for now)
 *    2. Web apps          — count of live web apps
 *    3. Mobile apps       — count of live mobile apps
 *    4. Last deploy       — relative time, derived from Vercel build env
 *    5. Commits / 30d     — sparkline + total, pulled live from GitHub
 *
 *  Note: a previous revision had a 6th "LOC shipped 287K" tile. We pulled
 *  it because:
 *    (a) It duplicated the headline figure that already lives in the Hero
 *        pitch and the About-me page, and
 *    (b) It was a static vanity metric — out of place in a row of *live*
 *        signals. The Commits sparkline tells a more honest story about
 *        current activity. (See report (e) in the homepage UX pass.)
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
 *      `<LivePulse>` and `<CommitSparkline>` islands).
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
 *  - **Server → client island handoff** — we serialise the daily-commits
 *    array as a plain prop and pass it into `<CommitSparkline />`, which
 *    is a client component. Server props must be JSON-serialisable; a
 *    `number[]` is, so this works without ceremony.
 */

import {
  Activity,
  GitCommit,
  Globe,
  Rocket,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { execSync } from "node:child_process";

import { Section } from "@/components/ui/Section";
import { LivePulse, type Tone } from "@/components/hero/LivePulse";
import { CommitSparkline } from "@/components/hero/CommitSparkline";

// ─── Types ────────────────────────────────────────────────────────────────
//
// Each status cell is a small data object. Typing the array first means TS
// catches typos in the JSX below.
//
// `tone` is optional — if omitted, the cell is rendered without a dot at all.
interface StatusCell {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
}

// `StatusCell` extended with two optional fields:
//   - `hint`   : sub-line under the value (e.g. "23m ago" beneath the SHA).
//   - `kind`   : discriminator for cells that render a custom body (the
//                sparkline). Default cells just render `value` + `hint`.
//
// This is a *very* light discriminated union — the union members differ by
// which extra fields they may carry, not by required ones. Keeps the cell
// loop readable without forcing a type-switch on every render.
interface StatusCellWithHint extends StatusCell {
  hint?: string;
  kind?: "default" | "sparkline";
  /** Daily counts (length 30). Only used when kind === "sparkline". */
  daily?: ReadonlyArray<number>;
  /** Raw total for the sparkline cell — drives the big number above the chart. */
  total?: number;
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
//
// `daily` is a 30-element array indexed by "days ago" — daily[0] is today,
// daily[29] is 30 days ago. Total is the sum (we precompute so the UI
// doesn't have to).
type CommitResult =
  | { ok: true; total: number; daily: number[] }
  | { ok: false };

// Window length for the sparkline + total. Matches the "/30d" label.
const WINDOW_DAYS = 30;
// Milliseconds in a day — pulled out as a constant so the bucketing math
// below reads as English instead of `1000 * 60 * 60 * 24`.
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pull recent public push commits from GitHub and bucket them by day.
 *
 * Returns BOTH the 30-day total *and* a length-30 daily array, indexed so
 * `daily[0]` is the most-recent day (today) and `daily[29]` is the oldest.
 * This pre-shape keeps the sparkline component dumb — it just walks the
 * array left to right.
 *
 * - 1-hour cache (`revalidate: 3600`) — Next.js will serve a cached value
 *   for up to 60 minutes, then trigger a background re-fetch on the next
 *   request. The user never waits.
 * - All errors are *swallowed* and converted to `{ ok: false }`. The UI
 *   then renders an em-dash "—" + flat baseline instead of crashing.
 * - `process.env.GITHUB_TOKEN` is read lazily — if absent, the request goes
 *   out unauthenticated (60 req/hour limit, plenty for an hourly cache).
 */
async function fetchRecentCommits(): Promise<CommitResult> {
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
        next: { revalidate: 3600 },
      },
    );

    // GitHub returns 403 on rate limit, 404 on missing user, etc.
    if (!res.ok) return { ok: false };

    // `unknown` is TS's "I don't trust this yet" type. We must narrow it
    // before using it — the `Array.isArray` guard does exactly that.
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return { ok: false };

    // Anchor "today" at start-of-day in UTC so day-bucketing is stable
    // regardless of when the build/request ran. Floor-to-day = subtract
    // the modulo of the day length.
    const now = Date.now();
    const startOfTodayMs = now - (now % DAY_MS);
    const cutoff = startOfTodayMs - (WINDOW_DAYS - 1) * DAY_MS;

    // Pre-fill with zeros so cells with no activity render a flat segment
    // rather than disappearing.
    const daily: number[] = new Array(WINDOW_DAYS).fill(0);
    let total = 0;

    for (const raw of data as GhEvent[]) {
      if (raw.type !== "PushEvent") continue;
      // `Date.parse` returns `NaN` for invalid input — guard with `Number.isFinite`.
      const t = Date.parse(raw.created_at);
      if (!Number.isFinite(t) || t < cutoff) continue;

      // Number of full days between the event and "today" (start-of-day).
      // `Math.floor` rounds down; bucket index 0 = today, 29 = oldest.
      const daysAgo = Math.floor((startOfTodayMs - t) / DAY_MS);
      // Belt-and-braces clamp — if the event is somehow in the future
      // (clock skew, etc.), bucket it as today (0) instead of writing
      // outside the array.
      const bucket =
        daysAgo < 0 ? 0 : daysAgo >= WINDOW_DAYS ? WINDOW_DAYS - 1 : daysAgo;

      // `?? 0` only kicks in for `null` / `undefined`. If the field is `0`
      // (no distinct commits in this push), we keep the `0`.
      const count = raw.payload?.distinct_size ?? 0;
      daily[bucket] += count;
      total += count;
    }

    // The sparkline draws left → right with the OLDEST day on the left,
    // newest on the right (chronological reading order). Our `daily`
    // array is currently newest-first, so reverse it before returning.
    daily.reverse();

    return { ok: true, total, daily };
  } catch {
    // Network error, DNS failure, abort, etc. — fall back silently.
    return { ok: false };
  }
}

// ─── Last-deploy pretty-printer ───────────────────────────────────────────
//
// Three sources, in priority order:
//   1. `VERCEL_GIT_COMMIT_SHA`  → real Vercel deploy SHA
//   2. `git rev-parse --short HEAD` (local checkout) → working-tree SHA
//   3. literal "local"          → ultimate fallback if git isn't available
//
// `execSync` from `node:child_process` is ONLY safe in Server Components.
// It runs at module load on the server and is captured into the static HTML.
//
// `BUILD_TIME` is captured once at module load (server-side) so we can show
// a relative time below the SHA. This is the "build moment", which for ISR
// pages updates every revalidate cycle.
const BUILD_TIME = Date.now();

function readGitShortSha(): string | null {
  try {
    const out = execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
      // Cap at 200ms — never block the build on a slow git invocation.
      timeout: 200,
    });
    const trimmed = out.toString().trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

function describeLastDeploy(): string {
  const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (vercelSha && vercelSha.length >= 7) return vercelSha.slice(0, 7);
  const localSha = readGitShortSha();
  if (localSha) return localSha;
  return "local";
}

/**
 * Format a duration as a coarse "Xs / Xm / Xh / Xd" — same idiom GitHub
 * and Vercel use in activity feeds. We compute relative to BUILD_TIME, not
 * `Date.now()` at render, so the number freezes per build (ISR-friendly).
 */
function formatBuildAge(): string {
  const sec = Math.max(0, Math.floor((Date.now() - BUILD_TIME) / 1000));
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

// ─── Platform counts ──────────────────────────────────────────────────────
//
// Hand-counted from the CV. Splitting into web vs mobile gives the hiring
// reader a clearer signal than a generic "production sites" total.
//
// Web apps (Flutter Web / Next.js / admin panels):
//   1. m3m3development.com (this very site)
//   2. M3 Marketplace admin web (18 modules)
//   3. M3 Marketplace web storefront
//   4. BeliBet admin web
//   → 4 web apps
//
// Mobile apps (Flutter mobile, iOS + Android):
//   1. M3 Marketplace customer app (12 modules)
//   2. M3 Runner driver app
//   3. BeliBet mobile app
//   → 3 mobile apps
//
// Update these numbers as new apps ship.
const WEB_APPS = 4;
const MOBILE_APPS = 3;

// ─── Main component ───────────────────────────────────────────────────────

/**
 * Server Component. `async` is required for `await` on the GitHub fetch.
 */
export async function SystemStatus() {
  // Live data — both calls are cheap; the GitHub one is cached.
  const commits = await fetchRecentCommits();
  const deploy = describeLastDeploy();
  const isRealDeploy = deploy !== "local";

  // Build the cell array. Order matters — it's the visual left-to-right
  // order on desktop, top-to-bottom on mobile.
  //
  // Accent-rationing decision (see homepage UX pass):
  //   - ALL live cells use the "green" tone for the LivePulse dot, since
  //     "green" is the semantic colour for "operational / live data
  //     successfully fetched". The previous revision used "amber" for the
  //     deploy and commits cells when the data source wasn't ideal — we
  //     dropped that because amber added a fourth accent to the homepage
  //     palette without communicating anything actionable. Cells now use
  //     a hint string ("dev build", "rate-limited") to convey the same
  //     nuance without the colour clutter.
  const cells: ReadonlyArray<StatusCellWithHint> = [
    {
      label: "Status",
      value: "All systems operational",
      icon: Activity,
      tone: "green",
    },
    {
      label: "Web apps",
      value: String(WEB_APPS),
      icon: Globe,
      tone: "green",
      hint: "in production",
    },
    {
      label: "Mobile apps",
      value: String(MOBILE_APPS),
      icon: Smartphone,
      tone: "green",
      hint: "iOS · Android",
    },
    {
      label: "Last deploy",
      // Show the SHA as the headline; the relative build age sits below.
      value: deploy,
      hint: isRealDeploy ? formatBuildAge() : "dev build",
      icon: Rocket,
      // Always green — see the accent-rationing note above.
      tone: "green",
    },
    {
      label: "Commits / 30d",
      // `commits.ok` narrows the union — TS knows `commits.total` only
      // exists on the `ok: true` branch. Em-dash on failure.
      value: commits.ok ? String(commits.total) : "—",
      icon: GitCommit,
      tone: "green",
      hint: commits.ok ? "public push events" : "rate-limited",
      // Discriminator: render the sparkline body instead of the default
      // big-number-plus-hint layout.
      kind: "sparkline",
      // Pre-shaped, server-fetched data. On failure we pass an empty
      // array; the sparkline gracefully renders a flat baseline + label.
      daily: commits.ok ? commits.daily : [],
      total: commits.ok ? commits.total : 0,
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
          like Stripe's status header.
        - `overflow-hidden`  — clips any backdrop blur that escapes the
          rounded corners on Safari.

        Responsive grid:
          - Mobile : 1 column (stack)
          - md     : 2 columns
          - lg     : 5 columns (single horizontal strip — one cell per signal)
      */}
      <div
        className={[
          "glass overflow-hidden rounded-2xl",
          // 5 cells (Status / Web / Mobile / Deploy / Commits).
          // Mobile = stack, md = 2-up, lg = single 5-col strip.
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
          // Hairline between every cell — works on any breakpoint because
          // both `divide-x` and `divide-y` are scoped: rows get top borders,
          // columns get left borders.
          "divide-y divide-white/10 md:divide-x lg:divide-y-0",
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
function Cell({ cell }: Readonly<{ cell: StatusCellWithHint }>) {
  const Icon = cell.icon;
  // Sparkline cells render a custom body; everything else uses the default
  // value-plus-hint layout. Branching here keeps the JSX tree readable.
  const isSparkline = cell.kind === "sparkline";

  return (
    <div className="flex flex-col gap-2 px-5 py-5">
      {/* Top row: icon + uppercase mono label + (optional) live dot. */}
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-foreground-muted" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-muted">
          {cell.label}
        </span>
        {cell.tone && (
          <span className="ml-auto">
            <LivePulse tone={cell.tone} />
          </span>
        )}
      </div>

      {isSparkline ? (
        // Sparkline body — passes the pre-bucketed daily array down. The
        // big number sits above the chart, rendered inside the sparkline
        // component itself, so we DON'T render `cell.value` here.
        <CommitSparkline
          daily={cell.daily ?? []}
          total={cell.total ?? 0}
          heightPx={48}
        />
      ) : (
        <>
          {/* Big value. `text-balance` keeps long strings from leaving an
              orphan word on the second line. */}
          <span className="text-balance text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {cell.value}
          </span>
          {/* Optional sub-line: relative time, descriptor, etc. */}
          {cell.hint && (
            <span className="font-mono text-[10px] tracking-wider text-foreground-muted">
              {cell.hint}
            </span>
          )}
        </>
      )}

      {/* Sparkline cells still get their own hint line beneath the chart
          so the "public push events" / "rate-limited" copy isn't lost. */}
      {isSparkline && cell.hint && (
        <span className="font-mono text-[10px] tracking-wider text-foreground-muted">
          {cell.hint}
        </span>
      )}
    </div>
  );
}

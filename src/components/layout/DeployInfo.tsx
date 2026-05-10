/**
 * DeployInfo — last-deployed timestamp + commit SHA, rendered in the Footer.
 *
 * What this file does
 *   On Vercel deploys, Vercel injects build-time env vars describing the
 *   commit that triggered the build (`VERCEL_GIT_COMMIT_SHA`, etc.). We
 *   read those at render time and show a single line:
 *
 *     "Last deploy <relative-time> · <short-sha>"
 *
 *   On non-Vercel builds (e.g. running `npm run dev` locally), those env
 *   vars are undefined and this component renders nothing. That keeps
 *   dev/local from showing fake or stale "deploy" info.
 *
 * Why a SERVER component?
 *   `process.env` is only meaningful on the server (it's a Node concept;
 *   the browser doesn't have one). Keeping this server-rendered also
 *   means the SHA is baked into the HTML — no client JS, no flash of
 *   missing content, no extra network round-trip.
 *
 *   IMPORTANT: Next inlines `process.env.X` at BUILD time when X is read
 *   in a server component, so the values are frozen at deploy time —
 *   exactly what we want for a "last deploy" indicator.
 *
 * Concepts demonstrated
 *   - Reading `process.env` from a server component.
 *   - Early-return pattern with `null` (renders nothing).
 *   - `Intl.RelativeTimeFormat` — built-in browser/Node API for
 *     localized "5 minutes ago" strings, no library needed.
 *   - The `<time dateTime>` element + ISO 8601 string for accessibility
 *     and machine-readable timestamps.
 */

/**
 * Format a Date as a relative-time string ("3 hours ago", "yesterday").
 * Falls back to a locale date string for distances over ~30 days.
 *
 * `Intl.RelativeTimeFormat` is a standard Web/Node API — no install needed.
 */
function formatRelative(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);

  // Pick the largest unit whose absolute value is < its boundary.
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / 86400), "day");

  // For older deploys, just show the date.
  return date.toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DeployInfo() {
  // Vercel env vars (https://vercel.com/docs/projects/environment-variables/system-environment-variables).
  // `process.env.X` is typed as `string | undefined`, which is why we
  // need the existence check below.
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  const repoOwner = process.env.VERCEL_GIT_REPO_OWNER;
  const repoSlug = process.env.VERCEL_GIT_REPO_SLUG;
  // Vercel doesn't expose a "deployed at" var directly, but the build
  // happens during `next build`, so capturing `new Date()` at module
  // load gives us the build timestamp — frozen into the static HTML.
  const buildTime = new Date();

  // No SHA means we're not on Vercel (or this is a dev build). Render
  // NOTHING — better than showing fake info.
  if (!sha) return null;

  const shortSha = sha.slice(0, 7);

  // Build a GitHub commit URL when we know the repo. Otherwise just
  // render the SHA as plain text.
  const commitUrl =
    repoOwner && repoSlug
      ? `https://github.com/${repoOwner}/${repoSlug}/commit/${sha}`
      : null;

  return (
    <p className="text-center font-mono text-[11px] text-foreground-muted">
      Last deploy{" "}
      {/* `<time>` with a machine-readable `dateTime` attr is the a11y-friendly
          way to mark up a timestamp. Screen readers and crawlers can both
          parse the ISO string. */}
      <time dateTime={buildTime.toISOString()}>{formatRelative(buildTime)}</time>{" "}
      ·{" "}
      {commitUrl ? (
        <a
          href={commitUrl}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dotted underline-offset-2 transition-colors hover:text-foreground"
          aria-label={`View commit ${shortSha} on GitHub`}
        >
          {shortSha}
        </a>
      ) : (
        // Fallback used when the repo env vars are absent (e.g. Vercel
        // build from a non-GitHub source). We still show the SHA, just
        // not as a link.
        <span>{shortSha}</span>
      )}
    </p>
  );
}

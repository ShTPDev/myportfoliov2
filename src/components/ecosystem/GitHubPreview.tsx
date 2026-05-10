/**
 * GitHubPreview — server-side rendered profile + recent push feed.
 *
 * Shows live activity (commit pushes across repos) instead of a static
 * "top repos" grid. This is the same signal GitHub's homepage shows: what
 * the developer is *currently* working on.
 *
 * Why a Server Component?
 *   - Token (if any) stays on the server.
 *   - Fetched data is embedded in the HTML — zero client JS for data, SEO
 *     sees the content, no loading spinner.
 *   - Next caches the GitHub response for 1 hour (see lib/github.ts).
 *
 * Concept showcase:
 *  - **`async` Server Component** — only legal in RSCs.
 *  - **`Promise.all` parallelization** — kick off both fetches together.
 *  - **Discriminated-union narrowing** — `pushEvents()` returns only
 *    `GhPushEvent`, so `event.payload.commits` is fully typed below.
 *  - **Relative time formatting** — small helper avoids pulling in
 *    `date-fns` / `dayjs` for one use site.
 *  - **Graceful fallback** — if GitHub is down/rate-limited, render a
 *    "view on github.com" card instead of crashing the page.
 */

import Image from "next/image";
import {
  fetchGhEvents,
  fetchGhUser,
  pushEvents,
  type GhPushEvent,
} from "@/lib/github";
import { Section } from "@/components/ui/Section";
import { SOCIALS } from "@/lib/constants";
import { ExternalLink, GitCommit } from "lucide-react";

// Hard-coded handle — same one in lib/constants.SOCIALS.github.
const GH_USERNAME = "ShTPDev";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Branch name from a `refs/heads/<branch>` ref string. */
function branchOf(ref: string): string {
  return ref.replace(/^refs\/heads\//, "");
}

/**
 * "5m", "2h", "3d" relative-time formatter. Cheap stand-in for date-fns;
 * good enough for a feed where exact times don't matter.
 */
function timeAgo(iso: string): string {
  const sec = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (sec < 60) return `${Math.floor(sec)}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d`;
  if (sec < 2592000) return `${Math.floor(sec / 604800)}w`;
  return `${Math.floor(sec / 2592000)}mo`;
}

/** First line of a commit message — GitHub renders this as the subject. */
function commitSubject(message: string): string {
  return message.split("\n")[0];
}

// ── Push card ───────────────────────────────────────────────────────────────
// One PushEvent → one card. Lists up to 3 commit subjects (GitHub itself
// truncates the events feed at ~20 commits per push).
function PushCard({ event }: { event: GhPushEvent }) {
  const repoName = event.repo.name; // "owner/repo"
  const repoUrl = `https://github.com/${repoName}`;
  const branch = branchOf(event.payload.ref);
  // Some PushEvents arrive without a `commits` array (force-pushes or
  // anonymized events). Default to [] so `.slice` doesn't throw.
  const allCommits = event.payload.commits ?? [];
  const commits = allCommits.slice(0, 3);
  const distinctSize = event.payload.distinct_size ?? allCommits.length;
  const extra = distinctSize - commits.length;

  return (
    <article className="glass flex flex-col gap-3 rounded-xl p-4 transition hover:bg-white/10">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sm font-semibold text-foreground transition hover:text-accent-cyan"
          >
            {repoName}
          </a>
          <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
            <GitCommit aria-hidden className="h-3 w-3" />
            <span>
              pushed to <span className="text-accent-cyan">{branch}</span>
            </span>
            <span>·</span>
            <span>
              {distinctSize} commit{distinctSize === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-foreground-muted">
          {timeAgo(event.created_at)}
        </span>
      </header>

      {/* Commit list — links to each commit on github.com via SHA. */}
      <ul className="space-y-1.5 border-l border-white/10 pl-3">
        {commits.map((c) => (
          <li
            key={c.sha}
            className="flex items-baseline gap-2 text-xs text-foreground-muted"
          >
            <a
              href={`${repoUrl}/commit/${c.sha}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] text-accent-cyan hover:underline"
            >
              {c.sha.slice(0, 7)}
            </a>
            <span className="line-clamp-1 text-foreground/90">
              {commitSubject(c.message)}
            </span>
          </li>
        ))}
        {extra > 0 && (
          <li className="font-mono text-[10px] text-foreground-muted/80">
            + {extra} more
          </li>
        )}
      </ul>
    </article>
  );
}

// ── Main section ────────────────────────────────────────────────────────────
export async function GitHubPreview() {
  // Run both fetches in parallel — Promise.all halves wall-clock time.
  const [user, events] = await Promise.all([
    fetchGhUser(GH_USERNAME),
    fetchGhEvents(GH_USERNAME, 50),
  ]);

  // Fallback when GitHub is unreachable / rate-limited / token missing.
  if (!user) {
    return (
      <Section
        id="github"
        eyebrow="GitHub"
        title="Code lives on GitHub."
        description="Live data temporarily unavailable — open the profile directly to see the latest work."
      >
        <a
          href={SOCIALS.github}
          target="_blank"
          rel="noreferrer"
          className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm transition hover:bg-white/10"
        >
          @{GH_USERNAME} on GitHub
          <ExternalLink aria-hidden className="h-4 w-4" />
        </a>
      </Section>
    );
  }

  const pushes = pushEvents(events, 8);

  return (
    <Section
      id="github"
      eyebrow="Open source"
      title="Live activity from GitHub."
      description="Recent pushes pulled directly from the GitHub Events API — refreshes hourly. Click any commit SHA to inspect it."
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ── Profile card (spans 1 column) ──────────────────────────── */}
        <div className="glass flex flex-col gap-4 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            {/* `next/image` with remote URL — host allowlisted in next.config.ts */}
            <Image
              src={user.avatar_url}
              alt={user.login}
              width={64}
              height={64}
              className="rounded-full ring-1 ring-white/10"
            />
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-foreground">
                {user.name ?? user.login}
              </div>
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm text-foreground-muted transition hover:text-accent-cyan"
              >
                @{user.login}
              </a>
            </div>
          </div>

          {user.bio && (
            <p className="text-sm leading-relaxed text-foreground-muted">
              {user.bio}
            </p>
          )}

          <dl className="mt-1 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
                Repos
              </dt>
              <dd className="mt-0.5 text-base font-semibold text-foreground">
                {user.public_repos}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
                Followers
              </dt>
              <dd className="mt-0.5 text-base font-semibold text-foreground">
                {user.followers}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
                Following
              </dt>
              <dd className="mt-0.5 text-base font-semibold text-foreground">
                {user.following}
              </dd>
            </div>
          </dl>

          <a
            href={user.html_url}
            target="_blank"
            rel="noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:opacity-90"
          >
            Open profile
            <ExternalLink aria-hidden className="h-3 w-3" />
          </a>
        </div>

        {/* ── Push feed (spans 2 columns on lg+) ─────────────────────── */}
        <div className="lg:col-span-2">
          {pushes.length === 0 ? (
            <p className="glass rounded-2xl p-6 text-sm text-foreground-muted">
              No recent pushes in the public events feed.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pushes.map((event) => (
                <PushCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

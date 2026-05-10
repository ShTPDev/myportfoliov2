/**
 * GitHubPreview — server-side rendered profile + top repos panel.
 *
 * Why a Server Component?
 *   - Token (if any) stays on the server.
 *   - Fetched data is embedded in the HTML — zero client JS for the data
 *     layer, search engines see the content, no loading spinner.
 *   - Next caches the GitHub response for 1 hour (see lib/github.ts), so
 *     repeated requests don't hammer the API.
 *
 * Async Server Components:
 *   This function is `async` — that's only legal in Server Components.
 *   Next awaits the fetch before rendering the HTML.
 *   Docs: node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md
 *
 * Concept showcase:
 *  - **`async` component** — only valid in Server Components.
 *  - **Promise.all parallelization** — kick off both fetches together
 *    instead of serially, halving wall-clock time.
 *  - **Graceful fallback** — if GitHub is down or rate-limits us, we render
 *    a small "view on github.com" card instead of crashing the page.
 *  - **`next/image` with remote hostname** — see `next.config.ts`; we
 *    allowlist `avatars.githubusercontent.com` so Next can optimize it.
 */

import Image from "next/image";
import {
  fetchGhRepos,
  fetchGhUser,
  topRepos,
  type GhRepo,
} from "@/lib/github";
import { Section } from "@/components/ui/Section";
import { SOCIALS } from "@/lib/constants";
import { ExternalLink, Star, GitFork } from "lucide-react";

// Hard-coded handle — same one in lib/constants.SOCIALS.github.
const GH_USERNAME = "ShTPDev";

// Tailwind classes for common GitHub languages so each repo card carries
// a tiny colored dot. Falls back to a neutral white when language is
// missing or unknown — a Record provides type-safety on the keys we set.
const LANG_DOT: Record<string, string> = {
  TypeScript: "bg-[#3178c6]",
  JavaScript: "bg-[#f1e05a]",
  Dart: "bg-[#00B4AB]",
  Python: "bg-[#3572A5]",
  Go: "bg-[#00ADD8]",
  Rust: "bg-[#dea584]",
  HTML: "bg-[#e34c26]",
  CSS: "bg-[#563d7c]",
  Shell: "bg-[#89e051]",
  C: "bg-[#555555]",
  "C++": "bg-[#f34b7d]",
  Java: "bg-[#b07219]",
  PHP: "bg-[#4F5D95]",
  Kotlin: "bg-[#A97BFF]",
  Swift: "bg-[#F05138]",
};

function langDotClass(lang: string | null): string {
  if (!lang) return "bg-white/40";
  return LANG_DOT[lang] ?? "bg-white/40";
}

// ── Repo card ───────────────────────────────────────────────────────────────
// Pure presentational — no animation here so the parent's <Reveal> can
// drive the cascade. Stays a server component (no `"use client"`).
function RepoCard({ repo }: { repo: GhRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="glass group flex h-full flex-col rounded-xl p-4 transition hover:-translate-y-0.5 hover:bg-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {repo.name}
        </h3>
        <ExternalLink
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 text-foreground-muted transition group-hover:text-accent-cyan"
        />
      </div>

      {repo.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-foreground-muted">
          {repo.description}
        </p>
      )}

      <div className="mt-auto flex items-center gap-3 pt-3 text-[11px] text-foreground-muted">
        {repo.language && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${langDotClass(
                repo.language,
              )}`}
            />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className="inline-flex items-center gap-1">
            <Star aria-hidden className="h-3 w-3" />
            {repo.stargazers_count}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span className="inline-flex items-center gap-1">
            <GitFork aria-hidden className="h-3 w-3" />
            {repo.forks_count}
          </span>
        )}
      </div>
    </a>
  );
}

// ── Main section ────────────────────────────────────────────────────────────
export async function GitHubPreview() {
  // Run both fetches in parallel — Promise.all halves wall-clock time vs.
  // awaiting each separately.
  const [user, repos] = await Promise.all([
    fetchGhUser(GH_USERNAME),
    fetchGhRepos(GH_USERNAME, { sort: "pushed", perPage: 24 }),
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

  const featured = topRepos(repos, 6);

  return (
    <Section
      id="github"
      eyebrow="Open source"
      title="Live from GitHub."
      description="Pulled directly from the GitHub API — refreshes hourly. Click any repo to open it on github.com."
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
              // Avatar is decorative + above-the-fold; let it lazy-load is fine.
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

        {/* ── Repos grid (spans 2 columns on lg+) ────────────────────── */}
        <div className="lg:col-span-2">
          {featured.length === 0 ? (
            <p className="glass rounded-2xl p-6 text-sm text-foreground-muted">
              No public repos to feature yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {featured.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

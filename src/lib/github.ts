/**
 * github.ts — server-side fetch helpers for the GitHub REST API.
 *
 * What this does:
 *   Calls the public GitHub REST API for a user profile and their repos,
 *   typed for safe rendering in a Server Component. Public endpoints work
 *   without auth (60 req/hr per IP); set `GITHUB_TOKEN` in `.env.local`
 *   to lift that to 5,000 req/hr.
 *
 * Why this file is server-only:
 *   - We never want to ship a token to the browser.
 *   - The fetches happen at build time (or per request, with `revalidate`),
 *     so the rendered HTML embeds the data — no client JS hits GitHub.
 *
 * Concept showcase:
 *  - **Typed `fetch` results** — declare the shape we expect; cast the
 *    `unknown` result safely after a guard. We could pull `@octokit/types`
 *    for full types, but a small hand-typed slice keeps the dep list lean.
 *  - **Next.js `fetch` extensions** — passing `{ next: { revalidate: N } }`
 *    tells Next to ISR-cache the response for N seconds. Different from
 *    the standard Web `fetch`. Docs:
 *    node_modules/next/dist/docs/01-app/02-guides/incremental-static-regeneration.md
 *  - **Optional bearer auth** — only attached when `GITHUB_TOKEN` is set.
 *  - **Graceful failure** — return `null` on errors so the UI can render a
 *    static fallback instead of crashing the page build.
 */

// ── Types we care about ─────────────────────────────────────────────────────
// These are tiny slices of GitHub's response — only the fields we render.

export interface GhUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
  blog: string | null;
}

export interface GhRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  topics: string[];
}

// ── Internal helpers ────────────────────────────────────────────────────────

/**
 * Build the headers object for every request. The User-Agent header is
 * REQUIRED by the GitHub API — calls without it can be rate-limited harder.
 * `Authorization: Bearer <token>` is added only if a token is configured.
 */
function ghHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "myportfoliov2",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// Cache responses for 1 hour. Tune up/down based on how live you want the
// data. ISR means Next serves the cached HTML instantly and refreshes in
// the background after `revalidate` seconds.
const REVALIDATE_SECONDS = 3600;

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch a GitHub user's profile. Returns `null` on any failure so the
 * caller can render a fallback.
 */
export async function fetchGhUser(username: string): Promise<GhUser | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: ghHeaders(),
      // `next.revalidate` is a Next-specific extension to fetch.
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as GhUser;
  } catch {
    return null;
  }
}

/**
 * Fetch a user's repos, sorted by the configured order. We strip out forks
 * and archived repos so the showcase only highlights real, active work.
 *
 * `sort: "pushed"` (most recently pushed) usually surfaces the strongest
 * "I'm currently working on this" signal. Use `"updated"` if you want
 * issue/PR activity to count, or `"created"` for newest-first.
 */
export async function fetchGhRepos(
  username: string,
  opts?: { sort?: "pushed" | "updated" | "created"; perPage?: number },
): Promise<GhRepo[]> {
  const sort = opts?.sort ?? "pushed";
  const perPage = opts?.perPage ?? 12;
  try {
    const url =
      `https://api.github.com/users/${username}/repos` +
      `?sort=${sort}&per_page=${perPage}&type=owner`;
    const res = await fetch(url, {
      headers: ghHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const all = (await res.json()) as GhRepo[];
    // Hide forks/archived — they dilute the showcase.
    return all.filter((r) => !r.fork && !r.archived);
  } catch {
    return [];
  }
}

/**
 * Pick the top N repos by stargazer count. Stars are an imperfect signal
 * but reliably surface the "best" repo first; falls back to recency on ties.
 */
export function topRepos(repos: GhRepo[], n: number = 6): GhRepo[] {
  return [...repos]
    .sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return Date.parse(b.pushed_at) - Date.parse(a.pushed_at);
    })
    .slice(0, n);
}

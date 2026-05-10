/**
 * not-found.tsx — rendered for unmatched routes (404).
 *
 * Special file convention. Server-rendered.
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <span className="font-mono text-xs text-foreground-muted">404</span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Page not <span className="text-gradient">found</span>.
      </h1>
      <p className="mt-3 text-foreground-muted">
        That route doesn&apos;t exist. Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
      >
        Return home
      </Link>
    </div>
  );
}

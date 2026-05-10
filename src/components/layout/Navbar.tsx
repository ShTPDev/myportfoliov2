/**
 * Navbar — sticky glass pill at the top of every page.
 *
 * This is a Server Component (no `"use client"`): there's no event handlers,
 * state, or browser-only APIs here, so it can render on the server and ship
 * zero JS for itself. `next/link` *does* hydrate on the client, but only
 * minimally for prefetching.
 */

import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* `glass` is our custom Tailwind v4 utility defined in globals.css via
          `@utility`. It applies the frosted-glass background + blur. */}
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full glass px-5 py-2.5 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight text-foreground"
        >
          {/* `text-gradient` is another @utility — clips a gradient to text. */}
          <span className="text-gradient font-semibold">{SITE.name}</span>
        </Link>

        {/* `hidden sm:flex` — hide on mobile, show as flex from sm breakpoint up. */}
        <nav className="hidden gap-6 text-sm text-foreground-muted sm:flex">
          {NAV_LINKS.map((l) => (
            // Keys help React diff lists efficiently. Use a stable unique value
            // (the href here, since each route is unique).
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact"
          className="rounded-full bg-accent-cyan/15 px-4 py-1.5 text-xs font-medium text-accent-cyan ring-1 ring-accent-cyan/30 transition hover:bg-accent-cyan/25"
        >
          Hire me
        </Link>
      </div>
    </header>
  );
}

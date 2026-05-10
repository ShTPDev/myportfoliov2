/**
 * Navbar — sticky glass pill at the top of every page.
 *
 * Mostly a Server Component, but it imports <MobileNav /> which is a client
 * component. That's fine — Next stitches the two trees together at the
 * "use client" boundary. Server-rendered HTML for static parts, hydrated
 * JS only for the mobile drawer.
 */

import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { MobileNav } from "./MobileNav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="relative mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full glass px-5 py-2.5 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight text-foreground"
        >
          {/*
            Logo glyph uses `SITE.shortName` ("STP") — keeps the navbar tight
            on mobile and reads as a monogram. Full name is still in the
            page title + footer for SEO and humans.
          */}
          <span className="text-gradient font-semibold">{SITE.shortName}</span>
        </Link>

        {/* Desktop links — hidden under sm breakpoint. */}
        <nav className="hidden gap-6 text-sm text-foreground-muted sm:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/*
            CTA copy reframed for the IT Manager pitch — this isn't a
            freelancer "hire me" pill, it's a hiring-manager-friendly
            "I'm reachable" signal. Style/classes unchanged.
          */}
          <Link
            href="/contact"
            className="hidden rounded-full bg-accent-cyan/15 px-4 py-1.5 text-xs font-medium text-accent-cyan ring-1 ring-accent-cyan/30 transition hover:bg-accent-cyan/25 sm:inline-flex"
          >
            Get in touch
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

/**
 * Navbar — sticky glass pill at the top of every page.
 *
 * Mostly a Server Component, but it imports two client components:
 *   - <MobileNav />     — hamburger drawer with state.
 *   - <PaletteButton /> — small ⌘K trigger; client-only because it
 *                         dispatches a DOM event when clicked.
 *
 * Next stitches server + client trees together at the "use client"
 * boundary: server-rendered HTML for static parts, hydrated JS only
 * where needed.
 */

import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { MobileNav } from "./MobileNav";
import { AvailablePill } from "./AvailablePill";
import { PaletteButton } from "./PaletteButton";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="relative mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full glass px-5 py-2.5 sm:px-6">
        {/*
          Logo wrapper — `group` enables `group-hover:` on the children so
          we can light up the gradient text without putting the hover
          listener on the inner spans (which would fight `text-gradient`).
        */}
        <Link
          href="/"
          className="group font-mono text-sm tracking-tight text-foreground"
        >
          {/*
            Logo uses the full name; on small screens it falls back to the
            short monogram ("STP") so the navbar stays tight on mobile.
            `hidden sm:inline` / `sm:hidden` swap the visible text at the sm
            breakpoint without duplicating link wrappers.

            Hover effect: the `text-gradient` utility paints the text with a
            cyan→violet gradient. On hover, we bump brightness (≈ a vibrancy
            kick) and add a soft drop-shadow so the gradient feels "lit up"
            without changing the colours themselves. `transition` smooths
            both at the same easing.
          */}
          <span className="text-gradient hidden font-semibold transition duration-200 group-hover:brightness-125 group-hover:drop-shadow-[0_0_12px_rgba(0,245,255,0.35)] sm:inline">
            {SITE.author}
          </span>
          <span className="text-gradient font-semibold transition duration-200 group-hover:brightness-125 group-hover:drop-shadow-[0_0_12px_rgba(0,245,255,0.35)] sm:hidden">
            {SITE.shortName}
          </span>
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
            Availability chip — hidden below md to keep the navbar tight
            on tablet/mobile (the mobile nav still surfaces contact via
            the drawer). `hidden md:inline-flex` is the Tailwind pattern
            for "show only at this breakpoint and up".
          */}
          <AvailablePill className="hidden md:inline-flex" />

          {/*
            ⌘K palette trigger. Hidden on small screens because typing
            ⌘K isn't possible without a keyboard, BUT we still want
            mobile users to reach the palette — they tap the hamburger
            and use links, OR we could expose this in MobileNav later.
          */}
          <PaletteButton className="hidden sm:inline-flex" />

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

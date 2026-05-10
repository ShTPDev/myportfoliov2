/**
 * AvailablePill — small "open to roles" status chip.
 *
 * What this file does
 *   Renders a glass pill in the Navbar showing a green dot, a short status
 *   message ("Open to IT Manager roles · Belize"), and a hover/click target
 *   that opens the user's mail client with a pre-filled subject. Designed
 *   to be a low-friction "I'm available" signal for hiring managers
 *   skimming the site.
 *
 * Why a SERVER component?
 *   No state, no event handlers, no hooks — just static markup. By
 *   omitting `"use client"` we let Next.js render this entirely on the
 *   server: zero client-side JS shipped for this chip. The browser
 *   receives plain HTML.
 *
 * Concept demonstrated
 *   - Default Server Component vs the explicit `"use client"` boundary
 *     used in CommandPalette / MobileNav.
 *   - `mailto:` URLs with a query string for the subject line. The subject
 *     value is URL-encoded so spaces and punctuation survive the trip.
 *   - Tailwind animation utility `animate-pulse` (built-in, no config) on
 *     the green dot for a subtle "live" feel.
 */

import { SITE } from "@/lib/constants";

/**
 * Props let the caller override the message if they want to reuse this
 * pill elsewhere (e.g. on a hero section). All optional.
 *
 * `Readonly<...>` is a TS utility type that marks every property as
 * read-only — props in React shouldn't be mutated, and this enforces it
 * at compile time.
 */
type AvailablePillProps = Readonly<{
  message?: string;
  subject?: string;
  className?: string;
}>;

export function AvailablePill({
  message = "Open to IT Manager roles · Belize",
  subject = "Re: IT Manager role",
  className = "",
}: AvailablePillProps) {
  // `encodeURIComponent` escapes characters that aren't safe in a URL
  // (spaces become %20, etc.). Without it, a subject like "Re: IT Manager"
  // could break the mailto link in some email clients.
  const href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;

  return (
    <a
      href={href}
      className={
        // `inline-flex` so the dot + text align on the same baseline.
        // ring-1 + ring-emerald-400/30 gives a subtle "live" outline.
        "inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-400/20 " +
        className
      }
      // `aria-label` makes the link's purpose explicit to screen readers
      // (otherwise they'd just read the visible text, which doesn't say
      // "this is a mailto link").
      aria-label={`Email ${SITE.author} about an IT Manager role`}
    >
      {/*
        Two stacked spans give the dot a "ping" effect: an outer animated
        ring + an inner solid dot. `animate-pulse` is a built-in Tailwind
        keyframe (opacity 0.5 → 1 → 0.5).
      */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span>{message}</span>
    </a>
  );
}

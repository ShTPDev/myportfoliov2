/**
 * ProjectNav — sticky scroll-spy "table of contents" for the /projects page.
 *
 * Renders a horizontal strip of chips (one per project) that:
 *   - Stays pinned to the top of the viewport while you scroll the page.
 *   - Highlights the chip whose section is currently in view.
 *   - Smooth-scrolls to the section when clicked.
 *   - Allows horizontal swipe/scroll inside the strip on mobile so 6 chips
 *     fit on a small screen without wrapping into two rows.
 *
 * Concept showcase — the new ideas in this file:
 *  - **`"use client"`** — uses browser-only APIs (`IntersectionObserver`,
 *    `useState`, `useEffect`). Server components can't run these, so we mark
 *    the file as a client boundary. See
 *    `node_modules/next/dist/docs/01-app/01-getting-started/05-rendering-and-data-fetching/01-server-and-client-components.md`.
 *  - **`IntersectionObserver`** — browser API that fires a callback whenever
 *    a watched element enters/leaves a region of the viewport. Cheaper than
 *    listening to `scroll` and recomputing offsets manually. MDN:
 *    https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API
 *  - **`useEffect` cleanup** — the function you RETURN from `useEffect` runs
 *    when the component unmounts (or when deps change). Critical for
 *    long-lived subscriptions like observers — without cleanup we'd leak
 *    one observer per mount.
 *  - **`useRef<HTMLDivElement | null>`** — a mutable container the React
 *    scheduler doesn't track. Perfect for "I need a handle to the DOM node
 *    but changing it shouldn't trigger a re-render".
 *  - **`Readonly<T>` props** — props are immutable from the consumer side;
 *    spelling that out in the type makes the contract obvious.
 *
 * Why a chip strip and not a sidebar? The /projects page is full-width
 * scroll-storytelling — a sidebar would compete for horizontal space with
 * the sticky case-study panel. A thin horizontal strip stays out of the way.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * One entry in the nav.
 *
 * `slug`  — must match the section's `id` attribute on the page (the link
 *           target). The case-study sections get `id={entry.slug}`.
 * `label` — what shows in the chip.
 * `tone`  — Tailwind class string for the small "tone dot" next to the
 *           label. Free-form so callers can reuse the same `accentClass`
 *           values from the data.
 */
export interface ProjectNavItem {
  slug: string;
  label: string;
  tone: string;
}

/**
 * Props are wrapped in `Readonly<...>` so TS reminds anyone editing this
 * component that they shouldn't mutate the incoming `items` array.
 *
 * `Readonly<{ ... }>` = "this object's keys can't be reassigned". It does
 * NOT deep-freeze; the array we receive should already be `readonly` from
 * the caller (we ask for `readonly ProjectNavItem[]`).
 */
export type ProjectNavProps = Readonly<{
  items: readonly ProjectNavItem[];
}>;

export function ProjectNav({ items }: ProjectNavProps): React.JSX.Element {
  // The slug of the section currently considered "active". Initialised to
  // the first item so the chip strip never renders with no active state on
  // first paint (avoids a brief "no highlight" flash before the observer
  // fires).
  const [activeSlug, setActiveSlug] = useState<string>(items[0]?.slug ?? "");

  // Ref to the horizontal-scrollable chip container. Used so we can scroll
  // the active chip INTO VIEW horizontally as the user scrolls vertically
  // through the page (otherwise the active chip can be off-screen on mobile).
  const stripRef = useRef<HTMLDivElement | null>(null);

  // ── Scroll-spy via IntersectionObserver ─────────────────────────────────
  //
  // We watch every `<section id={slug}>` on the page. The observer fires a
  // callback every time one of them crosses one of its threshold boundaries.
  // We then pick the entry that is "most" intersecting and mark its slug as
  // active.
  //
  // `rootMargin: "-30% 0px -60% 0px"` shrinks the observer's effective
  // viewport: we only consider a section "active" once its top crosses the
  // upper-third line of the screen. That way the active chip changes when
  // a section is genuinely the one the user is reading, not while it's just
  // peeking in from the bottom edge.
  useEffect(() => {
    // Build a list of element refs from slugs. `document.getElementById` is
    // safe inside `useEffect` because effects only run on the client.
    const elements = items
      .map((it) => document.getElementById(it.slug))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry whose section is most prominently in the active
        // band. We pick the one with the highest intersection ratio that's
        // currently intersecting; ties go to whatever appears earliest in
        // the source order (stable .sort() on a fresh array).
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveSlug(visible[0].target.id);
        }
      },
      {
        // Top inset = -30% pushes the activation line down into the page;
        // bottom inset = -60% means we de-activate sections that have
        // mostly left the top. The remaining 10% band is the "active band".
        rootMargin: "-30% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));

    // Cleanup: detach the observer when this component unmounts or when
    // `items` changes. Without this we'd leak an observer per remount.
    return () => observer.disconnect();
  }, [items]);

  // ── Click handler — smooth-scroll to the section ──────────────────────
  //
  // `useCallback` memoises the function so the chip's `onClick` reference
  // is stable across renders (small perf win + nicer React DevTools traces).
  // We `preventDefault` so the browser doesn't do the usual hash-jump
  // (which would update history with a `#slug` fragment AND skip the smooth
  // scroll on most browsers).
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
      e.preventDefault();
      const target = document.getElementById(slug);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Optimistically mark active so the chip lights up before the
        // observer fires — feels snappier on click.
        setActiveSlug(slug);
      }
    },
    [],
  );

  // ── Auto-scroll the active chip into view inside the strip ─────────────
  //
  // On mobile the strip is narrower than the chips combined, so without
  // this effect the active chip can be hidden off the right edge.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    // Find the currently-active chip element by data attribute. Querying
    // the DOM is fine here — we only do it once per active change.
    const activeEl = strip.querySelector<HTMLAnchorElement>(
      `[data-slug="${activeSlug}"]`,
    );
    if (activeEl) {
      // `scrollIntoView` with `inline: "center"` only scrolls along the
      // axis that actually overflows; on desktop where the strip fits in
      // one row this is effectively a no-op.
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeSlug]);

  return (
    // `sticky top-16` — pins the bar 4rem below the top of the viewport,
    // which is just below the global navbar. `z-30` keeps it above the
    // case-study content but below modal-tier overlays.
    //
    // `backdrop-blur` + translucent bg gives an Apple-style frosted look
    // when content scrolls under it.
    <nav
      aria-label="Projects table of contents"
      className="sticky top-16 z-30 -mx-6 mb-10 border-b border-white/5 bg-background/70 px-6 py-3 backdrop-blur-md"
    >
      <div
        ref={stripRef}
        // `overflow-x-auto` enables horizontal swipe on mobile.
        // `[scrollbar-width:none]` + `[&::-webkit-scrollbar]:hidden` hide
        // the scrollbar visually while keeping the strip scrollable.
        className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((it) => {
          const active = it.slug === activeSlug;
          return (
            <a
              key={it.slug}
              href={`#${it.slug}`}
              data-slug={it.slug}
              onClick={(e) => handleClick(e, it.slug)}
              // `aria-current="true"` is the accessible "you are here"
              // signal for landmarks/nav. Screen readers announce it.
              aria-current={active ? "true" : undefined}
              className={
                active
                  ? "inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-foreground ring-1 ring-white/20 transition"
                  : "inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-foreground-muted transition hover:border-white/20 hover:text-foreground"
              }
            >
              {/* Tone dot — uses the project's accent class so the strip
                  doubles as a colour legend for the page. `aria-hidden`
                  because it's purely decorative. */}
              <span
                aria-hidden
                className={`inline-block h-2 w-2 shrink-0 rounded-full ring-1 ${it.tone}`}
              />
              {it.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * AboutSectionNav — sticky chip-row that highlights the section currently
 * in view, and smooth-scrolls to whichever chip the user clicks.
 *
 * Why a Client Component? The "highlight which chip is active as the
 * user scrolls" behavior depends on `IntersectionObserver`, which only
 * exists in the browser. Anything that uses browser APIs or local state
 * has to live inside a `"use client"` boundary.
 *
 * Concept showcase (TS / React 19 for beginners):
 *   - **`"use client"`** — opt this whole module into client rendering.
 *     Doc: node_modules/next/dist/docs/01-app/04-client-server-components.md
 *   - **`useEffect`** — sets up the IntersectionObserver after the DOM
 *     is mounted and tears it down when this component unmounts.
 *   - **Strict purity rules (React 19)**: render must be pure, so we use
 *     `useState` to hold "active section id" and only mutate state from
 *     event/effect callbacks.
 *   - **Discriminated literal type** for the chip ids (`SectionId`) gives
 *     the compiler the exact set of valid ids — no typos compile.
 */

"use client";

import { useEffect, useState } from "react";

// ─── Section ids, declared once and used everywhere ───────────────────
//
// These ids must match the `id="…"` props on the matching <Section> /
// <DocSection> elements rendered by /about-me/page.tsx. If you rename
// one place, the TypeScript compiler can't catch the drift on the page
// side (because `id` is just a string), so keep these in sync by hand.
//
// `as const` + `typeof` + indexed-access is a common TS idiom to derive
// a literal-union type from an array of strings. Result:
//   SectionId = "story" | "values" | "now" | "resume" | "cv" | "contact"
const SECTION_IDS = [
  "story",
  "values",
  "now",
  "resume",
  "cv",
  "contact",
] as const;
type SectionId = (typeof SECTION_IDS)[number];

const LABELS: Record<SectionId, string> = {
  story: "Story",
  values: "Values",
  now: "/now",
  resume: "Resume",
  cv: "CV",
  contact: "Contact",
};

export function AboutSectionNav(): React.JSX.Element {
  // The "currently active" section id — null on first paint until the
  // observer fires once. Default to first section so the chip row never
  // looks blank on initial render.
  const [active, setActive] = useState<SectionId>("story");

  useEffect(() => {
    // Look up the DOM nodes by id. Some may not be on the page yet during
    // streaming, so we filter null values before observing.
    const elements = SECTION_IDS.map((id) => ({
      id,
      el: document.getElementById(id),
    })).filter((x): x is { id: SectionId; el: HTMLElement } => x.el !== null);

    if (elements.length === 0) return;

    // IntersectionObserver fires whenever a watched element crosses
    // configured "thresholds" of viewport overlap. We use a top-biased
    // rootMargin so a section is "active" once its top crosses ~30% from
    // the top of the viewport — feels right for chip-style nav.
    const observer = new IntersectionObserver(
      (entries) => {
        // Sort entries by their top position; pick the highest visible.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top,
          );
        if (visible.length > 0) {
          const id = visible[0].target.id as SectionId;
          setActive(id);
        }
      },
      {
        // -30% from top means "trigger when ~30% above viewport center".
        // -60% from bottom prevents two sections being "active" at once
        // when the user is in between them.
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0,
      },
    );

    elements.forEach((x) => observer.observe(x.el));
    // Cleanup runs when the component unmounts or the effect re-runs.
    return () => observer.disconnect();
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: SectionId,
  ) => {
    // We let the default `<a href="#id">` work for users without JS, but
    // when JS is available we override it to scroll smoothly with an
    // offset for the sticky navbar above this nav (~5rem).
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const offset = 88; // navbar (~64px) + this nav (~24px). Tune if either changes.
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    // Update state immediately so the chip highlight responds without
    // waiting for the observer to catch up after the smooth scroll.
    setActive(id);
  };

  return (
    // `sticky top-20` parks this row just below the navbar (which itself
    // is `sticky top-0`). `z-30` keeps it above page content but below the
    // navbar's `z-50`. `backdrop-blur` + slight tint maintains legibility
    // when content scrolls underneath.
    <nav
      aria-label="About page sections"
      className="sticky top-20 z-30 mx-auto w-full max-w-6xl px-6 pt-4"
    >
      <div className="glass flex flex-wrap items-center gap-1.5 rounded-full px-2 py-1.5">
        {SECTION_IDS.map((id) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              // `aria-current="location"` is the WAI-ARIA convention for
              // "this nav link points to the section currently in view".
              aria-current={isActive ? "location" : undefined}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                isActive
                  ? "bg-accent-cyan/20 text-accent-cyan ring-1 ring-accent-cyan/40"
                  : "text-foreground-muted hover:text-foreground hover:bg-white/5",
              ].join(" ")}
            >
              {LABELS[id]}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

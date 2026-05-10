/**
 * Stats — "at a glance" headline metrics strip.
 *
 * Why this is a Server Component (no `"use client"` directive at top):
 *   - It renders pure HTML from a static constant (`STATS`).
 *   - No `useState`, `useEffect`, refs, or event handlers.
 *   - No browser-only APIs (no `window`, no IntersectionObserver here — the
 *     `<Reveal>` children are themselves client components, and Next.js
 *     stitches that boundary automatically).
 *   In Next.js App Router, components are server-rendered by default; you
 *   only opt into client hydration when you need interactivity. Keeping
 *   static content on the server means less JavaScript shipped to the
 *   browser, which is exactly the right trade-off here.
 *
 * Concept showcase:
 *   - Importing from a typed `as const` data source (`STATS` from
 *     `@/lib/constants`) — each `value`/`label` is a literal string type,
 *     not just `string`.
 *   - Using the `Section` UI primitive for consistent vertical rhythm and
 *     header slot (eyebrow + title) shared with the rest of the page.
 *   - Wrapping each cell in `<Reveal>` with a staggered `delay` to create a
 *     left-to-right cascade as the strip scrolls into view.
 *   - The `text-gradient` Tailwind v4 `@utility` (defined in globals.css)
 *     paints text with the cyan→violet brand gradient via
 *     `background-clip: text`.
 */

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animations/Reveal";
import { STATS } from "@/lib/constants";

export function Stats() {
  return (
    <Section
      id="stats"
      eyebrow="At a glance"
      title="The numbers behind the work."
    >
      {/*
        Grid: 2 columns on mobile so each stat still reads at a glance,
        4 columns from md breakpoint up so the strip feels like a single row.
        `gap-y-8` keeps mobile rows breathing while `gap-x-6` is enough on
        desktop where the items are wider.
      */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        {STATS.map((stat, i) => (
          // `delay={i * 0.08}` — each cell starts 80ms after the previous
          // one, producing a subtle left-to-right cascade. `key` uses the
          // label since values like "5+" / "4+" repeat enough that a value
          // key would risk a clash if STATS ever grows.
          <Reveal key={stat.label} delay={i * 0.08}>
            <div className="flex flex-col items-start">
              <span className="text-gradient text-4xl font-semibold tracking-tight sm:text-5xl">
                {stat.value}
              </span>
              <span className="mt-2 text-sm text-foreground-muted">
                {stat.label}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/**
 * CareerTimeline — vertical "story-of-my-career" rail.
 *
 * Replaces the old 3-column bio block on /about-me. A vertical timeline
 * with a left rail (dots + connector line) and right-side content reads
 * as a story rather than three disconnected paragraphs, and gives hiring
 * panels a fast scan of progression at a glance.
 *
 * Server-renderable on purpose — we let one client island (`<Reveal>`) do
 * the scroll-triggered fade so each milestone "appears" as the user
 * scrolls the rail. Everything else is pure HTML + CSS.
 *
 * Concept showcase (TS for beginners):
 *   - **Data-driven UI**: the array `CAREER_MILESTONES` lives in
 *     `src/data/career.ts`. The component just `.map()`s over it. To add
 *     a milestone, edit data — no JSX changes here.
 *   - **No props** — everything is internal. We export a component, not
 *     a configurable widget. (If someday we want this on another page we
 *     can add props then; YAGNI for now.)
 */

import { Reveal } from "@/components/animations/Reveal";
import { CAREER_MILESTONES } from "@/data/career";

export function CareerTimeline(): React.JSX.Element {
  return (
    // `relative` — children may absolutely-position inside this container
    // (the connector rail). `pl-8 sm:pl-10` reserves room for the left rail.
    <ol className="relative space-y-8">
      {/*
        The vertical rail itself. `absolute` positioned at left:1rem with a
        thin gradient line. `aria-hidden` because it's decorative — the
        <ol>/<li> structure already conveys the chronology.
      */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-[14px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-cyan/60 via-white/15 to-transparent"
      />

      {CAREER_MILESTONES.map((m, idx) => (
        // Each milestone fades + slides up as it enters the viewport.
        // `delay` staggers them so the rail "fills in" rather than all
        // appearing at once. `amount={0.1}` = trigger when 10% visible.
        <Reveal
          key={`${m.year}-${m.title}`}
          direction="up"
          // 0.05s × index keeps the cascade tight — quick enough that
          // power-scrollers don't notice, slow enough to feel intentional.
          delay={idx * 0.05}
          amount={0.1}
        >
          <li className="relative pl-10">
            {/*
              Dot marker — sits ON the rail. Slightly larger glow ring so
              the active row reads as a "node" rather than a flat dot.
              Tailwind: `before:` would also work, but a child <span> is
              more readable for beginners.
            */}
            <span
              aria-hidden
              className="absolute left-2 top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-accent-cyan ring-4 ring-accent-cyan/20"
            />

            {/* Year chip — small monospace pill, mirrors the eyebrow style
                used elsewhere on the site so the page feels consistent. */}
            <span className="inline-block rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan ring-1 ring-white/10">
              {m.year}
            </span>

            <h3 className="mt-2 text-base font-semibold text-foreground sm:text-lg">
              {m.title}
            </h3>

            <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted sm:text-base">
              {m.context}
            </p>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

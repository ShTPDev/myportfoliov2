/**
 * OnboardingPlan — 30/60/90 day plan section on /services.
 *
 * Why this exists:
 *   "What's your 30/60/90?" is a standard interview question for IT Manager
 *   hires. Surfacing the answer on the portfolio (rather than waiting to be
 *   asked) signals that the candidate has thought past day-one tactics into
 *   a structured roadmap. Cards are intentionally generic-but-credible:
 *   bullet outcomes, not prose.
 *
 * Server-renderable:
 *   No `"use client"`. Pure presentational JSX over a static array.
 *
 * Concept showcase:
 *  - **Tuple-of-objects with `as const`** — the three phases are a fixed
 *    sequence (we'll never have a 4th column), so a tuple expresses intent
 *    better than a `Phase[]` array. `as const` preserves literal types on
 *    every field for autocomplete.
 *  - **`readonly` array of bullets** — `outcomes: readonly string[]` means
 *    the consumer can't mutate the bullet list at runtime by accident.
 *  - **Tailwind responsive grid** — `grid-cols-1 md:grid-cols-3` stacks the
 *    cards on mobile, and lays them side-by-side from the medium breakpoint
 *    upward. We use `gap-4` to match the competencies grid above so the two
 *    sections feel like part of the same visual rhythm.
 *  - **`Reveal` cascade** — each card fades in slightly later than the one
 *    before it; same trick we use on the competencies grid.
 */

import { Reveal } from "@/components/animations/Reveal";

interface Phase {
  /** Tagline shown above the title — "Days 1–30", "Days 31–60", … */
  readonly window: string;
  /** Short title of the phase ("Listen + audit"). */
  readonly title: string;
  /** 3 short outcome bullets. Kept ≤80 chars each so cards stay scannable. */
  readonly outcomes: readonly string[];
}

/**
 * Three phases. Copy is dual-track on purpose — every bullet has an analog
 * for either an IT Manager OR a Software Engineer engagement so the same
 * plan reads sensibly under either toggle state on the page above.
 */
const PHASES: readonly Phase[] = [
  {
    window: "Days 1–30",
    title: "Listen + audit",
    outcomes: [
      "Shadow operations and map every system, vendor, and integration touchpoint.",
      "Inventory the existing codebase, deploy pipeline, and on-call rotations.",
      "Identify the top three risk surfaces (security, uptime, data integrity).",
    ],
  },
  {
    window: "Days 31–60",
    title: "Quick wins",
    outcomes: [
      "Ship the first payments / auth uplift behind a feature flag, with rollback plan.",
      "Tighten one ops gap — patching cadence, backup verification, or vendor SLA.",
      "Stand up baseline observability dashboards the whole team can read.",
    ],
  },
  {
    window: "Days 61–90",
    title: "Build the plan",
    outcomes: [
      "Publish a 12-month roadmap aligned to business priorities, with cost estimates.",
      "Hand-off runbooks for every operational responsibility I personally absorbed.",
      "Define hiring / training plan to remove single-points-of-knowledge.",
    ],
  },
] as const;

export function OnboardingPlan() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {PHASES.map((phase, i) => (
        // Cascade: each card waits a touch longer than the previous one.
        <Reveal key={phase.window} delay={i * 0.08} className="h-full">
          <article className="glass flex h-full flex-col rounded-2xl p-6">
            {/* Eyebrow — mono cyan, same family as the rest of the page. */}
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-cyan">
              {phase.window}
            </span>
            <h3 className="mt-2 text-lg font-semibold text-foreground">
              {phase.title}
            </h3>

            {/* Outcome bullets — reuse the dot pattern from `StickyCaseStudy`
                so the visual language stays consistent across the site. */}
            <ul className="mt-4 space-y-2">
              {phase.outcomes.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-sm leading-relaxed text-foreground/90"
                >
                  <span
                    aria-hidden
                    className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-accent-cyan"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

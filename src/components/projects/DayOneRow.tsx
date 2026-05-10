/**
 * DayOneRow — one entry in the "Day-one deliverables" list on /services.
 *
 * Visual: a horizontal glass row with a mono-font number badge ("01", "02"…)
 * on the left, headline + detail on the right, and a subtle hover lift to
 * signal interactivity even though the row itself doesn't currently link
 * anywhere. (We can promote it to <a> later without changing any callers.)
 *
 * Why a dedicated component?
 *   The /services page renders five of these in a `Reveal` cascade. Pulling
 *   the row into its own component keeps the page file readable and lets us
 *   reuse the row pattern elsewhere (e.g. an "onboarding plan" page).
 *
 * Server-renderable:
 *   No `"use client"` directive — purely presentational, no state or events.
 *
 * Concept showcase:
 *  - **Number formatting via `padStart`** — `String(n).padStart(2, "0")`
 *    turns 1 → "01", 2 → "02", etc. `padStart(targetLength, padString)` is
 *    a standard JS String method; the leading-zero "01" feels intentional
 *    and editorial vs. a plain "1.".
 *  - **Tailwind glass utility** — same `glass` we use everywhere.
 *  - **Tailwind `tracking-[…]` arbitrary value** — square brackets let us
 *    inline a CSS value (`letter-spacing: 0.18em`) without authoring a new
 *    utility. Useful for one-off design tokens.
 *  - **Explicit prop type** — exporting the props type isn't required, but
 *    typing the parameter inline makes the contract obvious to readers.
 */

export function DayOneRow({
  index,
  headline,
  detail,
}: {
  // 1-based ordinal. We render `01`, `02`, ... by padding the string form.
  index: number;
  headline: string;
  detail: string;
}) {
  // `String(index)` first coerces the number to a string, then `padStart(2, "0")`
  // ensures it's at least 2 chars wide, padding with "0" on the left.
  const ordinal = String(index).padStart(2, "0");

  return (
    <div
      className={[
        "glass group relative flex items-start gap-5 overflow-hidden rounded-2xl p-5 sm:p-6",
        // `motion-safe:` only applies the transition for users who haven't
        // requested reduced motion. Defensive nicety, since `globals.css`
        // already neutralises long animations under `prefers-reduced-motion`.
        "motion-safe:transition motion-safe:hover:-translate-y-0.5 hover:bg-white/10",
      ].join(" ")}
    >
      {/* Mono number badge. Fixed width keeps the headline column aligned
          even when ordinals jump from "09" to "10" in longer lists. */}
      <div className="flex shrink-0 items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent-cyan">
          {ordinal}
        </span>
      </div>

      <div className="flex flex-col">
        <h3 className="text-base font-semibold text-foreground sm:text-lg">
          {headline}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
          {detail}
        </p>
      </div>
    </div>
  );
}

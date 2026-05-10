/**
 * DayOneRow — one entry in the "Day-one deliverables" list on /services.
 *
 * Visual: a horizontal glass row with EITHER a Lucide icon OR a mono-font
 * number badge ("01", "02"…) on the left, headline + detail in the middle,
 * and an optional metric chip pinned to the right (or stacked under the
 * headline on mobile).
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
 *  - **Optional props** (`metric?`, `icon?`) — the trailing `?` marks each
 *    prop optional. Callers can pass any subset; we render the right shape
 *    based on what's present.
 *  - **`LucideIcon` type** — the type of a Lucide React icon component. We
 *    capitalize the local alias (`const RowIcon = icon`) so JSX treats it as
 *    a component instead of a raw HTML tag.
 *  - **Number formatting via `padStart`** — `String(n).padStart(2, "0")`
 *    turns 1 → "01", 2 → "02". `padStart(targetLength, padString)` is a
 *    standard JS String method.
 *  - **Tailwind responsive layout** — `flex-col sm:flex-row` flips the
 *    middle/metric stacking based on viewport width. The metric chip uses
 *    `sm:ml-auto` to push itself to the right side on tablets+ but sits
 *    flush-left on phones for legibility.
 */

import type { LucideIcon } from "lucide-react";

export function DayOneRow({
  index,
  headline,
  detail,
  metric,
  icon,
}: {
  // 1-based ordinal. Rendered as `01`, `02`, ... by padding the string form.
  index: number;
  headline: string;
  detail: string;
  /**
   * Optional concrete signal pinned to the right of the row, e.g. "6–8
   * weeks", "MFA · biometric · PCI". Mono-font pill so it reads as a
   * machine-truth nugget rather than prose.
   */
  metric?: string;
  /**
   * Optional Lucide icon to replace the numeric badge. When provided, the
   * ordinal still renders as a tiny mono badge in the corner so the reader
   * keeps the "step N of 5" sequencing.
   */
  icon?: LucideIcon;
}) {
  // `String(index)` first coerces the number to a string, then `padStart(2, "0")`
  // ensures it's at least 2 chars wide, padding with "0" on the left.
  const ordinal = String(index).padStart(2, "0");

  // Capitalised local alias for JSX. We can only use it inside a JSX tag if
  // it starts with an uppercase letter (lowercase tags are treated as raw
  // HTML elements). `RowIcon` will be `undefined` if no icon was passed,
  // and the `&&` guard below handles that.
  const RowIcon = icon;

  return (
    <div
      className={[
        // Outer row — `items-start` keeps the badge top-aligned with the
        // headline even when the detail wraps to multiple lines.
        "glass group relative flex items-start gap-5 overflow-hidden rounded-2xl p-5 sm:p-6",
        // `motion-safe:` only applies the transition for users who haven't
        // requested reduced motion. Defensive nicety, since `globals.css`
        // already neutralises long animations under `prefers-reduced-motion`.
        "motion-safe:transition motion-safe:hover:-translate-y-0.5 hover:bg-white/10",
      ].join(" ")}
    >
      {/*
        Badge column. Two variants:
          - `RowIcon` provided  → render the icon as the primary glyph,
            with the ordinal beneath as a tiny mono caption.
          - no icon            → render the ordinal as the primary mono badge
            (legacy behaviour, preserves any existing callers).
      */}
      <div className="flex shrink-0 flex-col items-center justify-center gap-1">
        {RowIcon ? (
          <>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-violet/15 text-accent-violet ring-1 ring-accent-violet/30">
              <RowIcon size={18} aria-hidden />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-muted/70">
              {ordinal}
            </span>
          </>
        ) : (
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent-cyan">
            {ordinal}
          </span>
        )}
      </div>

      {/*
        Middle + right group. On mobile we stack (metric below the body);
        on `sm:` and up we let them sit on the same row with the metric
        pinned right via `ml-auto`. `flex-1` lets the body column eat all
        remaining horizontal space so the metric pill stays compact.
      */}
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex flex-1 flex-col">
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            {headline}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
            {detail}
          </p>
        </div>

        {/*
          Optional metric chip. `whitespace-nowrap` keeps short tokens like
          "6–8 weeks" on a single line; longer compound chips ("MFA ·
          biometric · PCI") wrap naturally because the chip itself sits in
          a flex item with a max-content sizing on `sm:`.
        */}
        {metric && (
          <span
            className={[
              "inline-flex shrink-0 items-center self-start whitespace-nowrap rounded-full",
              "border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1",
              "font-mono text-[10px] uppercase tracking-wider text-accent-cyan",
              // On tablet+ push the chip to the right edge of the row.
              "sm:ml-auto sm:mt-1",
            ].join(" ")}
          >
            {metric}
          </span>
        )}
      </div>
    </div>
  );
}

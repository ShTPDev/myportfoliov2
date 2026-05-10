/**
 * CommitSparkline — tiny SVG sparkline of daily GitHub commits.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  WHAT THIS FILE DOES
 * ─────────────────────────────────────────────────────────────────────────────
 *  Takes a 30-element array of daily commit counts and renders two SVG paths:
 *    1. A filled area under the curve (subtle accent-cyan tint).
 *    2. A 1.5px stroke line on top (solid accent-cyan).
 *
 *  Used inside the SystemStatus "Commits / 30d" cell to visualise recent
 *  push activity instead of just a single number. Same idiom GitHub itself
 *  uses on the contribution graph — but compressed to one line.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  WHY THIS IS A CLIENT COMPONENT
 * ─────────────────────────────────────────────────────────────────────────────
 *  Strictly speaking, this *could* be a server component — it has no state,
 *  effects, or browser APIs. But we want to keep the door open for adding a
 *  hover tooltip later (mouse events → state → "use client"), and the SVG
 *  payload is identical either way. Marking it client now means future
 *  edits don't need to refactor the boundary.
 *
 *  If you want to flip it back to a server component later, just delete
 *  the `"use client"` line at the top — there's nothing else stopping it.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  TS / REACT CONCEPTS DEMONSTRATED
 * ─────────────────────────────────────────────────────────────────────────────
 *  - **`Readonly<{ ... }>` props** — TS utility type that marks every field
 *    read-only. React props shouldn't be mutated; this enforces it.
 *  - **`ReadonlyArray<T>`** — array TS knows we won't mutate. Reads cleaner
 *    than `readonly T[]` for beginners.
 *  - **Path-data computation in render** — pure function of props, so the
 *    work is cheap and re-runs naturally when `daily` changes. NO `useMemo`
 *    needed (and no Math.random — strict React 19 purity).
 *  - **SVG `viewBox` + `preserveAspectRatio="none"`** — lets the SVG stretch
 *    to whatever width its container has while keeping a fixed coordinate
 *    system internally. We compute against a 100×40 grid; the browser maps
 *    that onto the actual rendered pixels.
 */

"use client";

// ─── Types ────────────────────────────────────────────────────────────────
//
// `daily` is documented as length-30, but TS can't enforce array length on
// a plain `number[]` without exotic tuple types — so we accept any-length
// `ReadonlyArray<number>` and defensively handle the edge cases below.
type CommitSparklineProps = Readonly<{
  daily: ReadonlyArray<number>;
  /** Total commits in the window — rendered next to the sparkline. */
  total: number;
  /** Optional tweak for vertical real-estate. Defaults to 80 px. */
  heightPx?: number;
}>;

// ─── Internal SVG coordinate space ────────────────────────────────────────
//
// We draw against a fixed 100×40 viewBox and let CSS stretch the SVG to the
// container width. This decouples the path math from the rendered size.
const VB_WIDTH = 100;
const VB_HEIGHT = 40;
// Inset from the top/bottom so the stroke isn't clipped by the viewBox edge.
const VB_PAD_Y = 2;

/**
 * Convert a single (index, value) pair to (x, y) in the SVG viewBox.
 *
 * - `x` walks evenly from 0 to VB_WIDTH across the array.
 * - `y` is inverted (SVG y=0 is the top): higher commit counts sit higher
 *   on the chart, lower counts sit closer to the baseline.
 */
function toPoint(
  index: number,
  value: number,
  count: number,
  max: number,
): { x: number; y: number } {
  // Avoid division-by-zero when there's only 1 point.
  const x = count <= 1 ? 0 : (index / (count - 1)) * VB_WIDTH;
  // `max` is guaranteed > 0 by the caller (we substitute 1 if the data is
  // all-zeros). Inverting the ratio puts the largest value near the top.
  const ratio = value / max;
  const usable = VB_HEIGHT - VB_PAD_Y * 2;
  const y = VB_HEIGHT - VB_PAD_Y - ratio * usable;
  return { x, y };
}

/**
 * Build the `d=` attribute for the line path. Uses simple straight segments
 * (`L` commands) because the data is integer counts — smoothing would imply
 * fractional commits, which is misleading.
 */
function buildLinePath(daily: ReadonlyArray<number>, max: number): string {
  if (daily.length === 0) return "";
  const segments: string[] = [];
  for (let i = 0; i < daily.length; i += 1) {
    const { x, y } = toPoint(i, daily[i] ?? 0, daily.length, max);
    // First point uses `M` (move to), subsequent points use `L` (line to).
    segments.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return segments.join(" ");
}

/**
 * Build the `d=` attribute for the filled area underneath the line.
 * Closes the path back along the bottom edge so the fill sits between the
 * curve and the baseline.
 */
function buildAreaPath(daily: ReadonlyArray<number>, max: number): string {
  if (daily.length === 0) return "";
  const line = buildLinePath(daily, max);
  // Close: down to bottom-right, across to bottom-left, then `Z` shuts it.
  const bottomRight = `L${VB_WIDTH.toFixed(2)} ${VB_HEIGHT.toFixed(2)}`;
  const bottomLeft = `L0 ${VB_HEIGHT.toFixed(2)}`;
  return `${line} ${bottomRight} ${bottomLeft} Z`;
}

/**
 * Sparkline component. Pure function of props — no state, no effects.
 *
 * Edge cases handled:
 *   - Empty array          → renders a flat baseline + "no data" label.
 *   - All zeros            → renders a flat baseline at the bottom (max=1
 *                            so the line lives at the bottom of the chart).
 *   - One data point       → renders a single dot (degenerate path).
 */
export function CommitSparkline({
  daily,
  total,
  heightPx = 80,
}: CommitSparklineProps) {
  // `Math.max(...daily)` works on number arrays, but spreading a *readonly*
  // array tripped older TS versions — use a manual reduce to stay safe.
  let peak = 0;
  for (const v of daily) {
    if (v > peak) peak = v;
  }
  // `peak || 1` avoids divide-by-zero in the y-coordinate math when every
  // day in the window has zero commits.
  const max = peak || 1;

  // Flat-baseline fallback: no data at all → show a horizontal line at the
  // bottom of the viewBox + a label, so the cell never looks broken.
  const hasData = daily.length > 0 && peak > 0;

  const linePath = buildLinePath(daily, max);
  const areaPath = buildAreaPath(daily, max);

  return (
    <div className="flex flex-col gap-1">
      {/* Header row: total count on the left, window label on the right. */}
      <div className="flex items-baseline justify-between">
        <span className="text-balance text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {total}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-muted">
          {hasData ? "30d" : "no data"}
        </span>
      </div>

      {/*
        SVG container.
        - `width="100%"` lets the chart grow to the parent cell.
        - `preserveAspectRatio="none"` is the trick that makes the 100×40
          viewBox stretch to whatever pixel size we render at — without it,
          the chart would letterbox itself.
        - `aria-hidden` because the headline number above already conveys
          the meaning; the chart is a visual augment, not the primary signal.
      */}
      <svg
        viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
        preserveAspectRatio="none"
        width="100%"
        height={heightPx}
        aria-hidden="true"
        className="block"
      >
        {hasData ? (
          <>
            {/*
              Filled area. `currentColor` defers to the SVG's `text-...`
              utility on the parent for theming; we set the parent to
              accent-cyan via Tailwind below.
            */}
            <path
              d={areaPath}
              fill="currentColor"
              opacity={0.18}
              className="text-accent-cyan"
            />
            {/* Line stroke — same colour, full opacity. */}
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              className="text-accent-cyan"
            />
          </>
        ) : (
          // Flat baseline — single horizontal line near the bottom of the
          // viewBox. Communicates "we tried to render a chart but had
          // nothing to show" without screaming "ERROR".
          <line
            x1={0}
            x2={VB_WIDTH}
            y1={VB_HEIGHT - VB_PAD_Y}
            y2={VB_HEIGHT - VB_PAD_Y}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.3}
            className="text-foreground-muted"
          />
        )}
      </svg>
    </div>
  );
}

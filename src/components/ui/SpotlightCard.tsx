/**
 * SpotlightCard + SpotlightGrid — Linear-style "shared cursor spotlight".
 *
 * What it does
 * ------------
 * Wrap a grid of cards in <SpotlightGrid>. Each child <SpotlightCard> renders
 * a glassy panel whose border *glows toward the cursor* via a radial gradient
 * pinned to two CSS custom properties: `--mx` and `--my`.
 *
 * The trick (and why it's cheap)
 * ------------------------------
 * Only ONE element listens for mousemove — the grid wrapper. On each move it
 * writes the cursor's coordinates (in its own local space, via
 * getBoundingClientRect) into CSS variables on itself. CSS variables *cascade*,
 * so every descendant card reads the same `--mx` / `--my` automatically. No
 * React re-renders, no per-card listeners, no prop drilling. This is exactly
 * how Linear's marketing site does its hero card grid.
 *
 * The visible glow is drawn by a `::before` pseudo-element on each card. It's
 * a `radial-gradient(... at var(--mx) var(--my), <accent>, transparent)`, so
 * as the variables update, the gradient's centre moves with the cursor.
 *
 * Concepts demonstrated (TS / React / CSS)
 * ----------------------------------------
 *  - **`"use client"`** — required because we touch the DOM (refs, listeners,
 *    `matchMedia`) and use `useEffect`/`useRef`. Server components have no
 *    browser to talk to.
 *  - **`useRef<HTMLDivElement | null>(null)`** — generic DOM ref. The `| null`
 *    matches React's actual runtime: refs start as null until the element
 *    mounts.
 *  - **`requestAnimationFrame` throttle** — `mousemove` fires faster than the
 *    monitor refreshes. We coalesce many events into one paint by tracking
 *    "is a frame already pending?" with a ref. Cheap and avoids dropped frames.
 *  - **CSS Custom Properties as cross-component state** — instead of passing
 *    coords through React context (which would re-render everything), we
 *    write to the DOM and let the cascade do the work. CSS is the API.
 *  - **`prefers-reduced-motion`** — accessibility. If the user has motion
 *    reduced at the OS level, we don't run the listener at all and the card
 *    falls back to a static glass border.
 *  - **Type-only import** — `type ReactNode` ships zero JS; it's erased after
 *    type-checking. See `node_modules/typescript/lib/lib.dom.d.ts` for DOM
 *    types and MDN for `getBoundingClientRect`.
 *
 * Why we DON'T just listen on each card
 * -------------------------------------
 * If each card had its own `onMouseMove`, only the *hovered* card would know
 * the cursor position. Linear's effect specifically wants neighbouring cards
 * to glow toward the cursor too — they share one light source. Putting the
 * listener on the wrapper + cascading via CSS vars is the simplest way to
 * get that "shared spotlight" feel.
 */

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* SpotlightGrid                                                       */
/* ------------------------------------------------------------------ */

/**
 * Props for the wrapper. We accept `className` so callers can keep using the
 * same Tailwind grid utilities they had on a plain <div> (e.g. `grid grid-cols-2`).
 *
 * `Readonly<T>` would be slightly more strict but adds noise; React already
 * treats props as immutable by convention, and this codebase prefers an
 * explicit object type literal for teaching readability.
 */
type SpotlightGridProps = {
  children: ReactNode;
  className?: string;
};

export function SpotlightGrid({
  children,
  className,
}: SpotlightGridProps) {
  // Ref to the wrapper DIV — we need the actual DOM node to (a) read its
  // bounding rect for cursor → local coords, and (b) write CSS variables on
  // its `style` map. Generic param is the element's TS type.
  const ref = useRef<HTMLDivElement | null>(null);

  // Throttle bookkeeping. We don't want to update CSS vars on every single
  // `mousemove` (those can fire 1000+/s on high-poll mice). Instead we mark
  // "an update is queued for the next animation frame" and coalesce.
  const rafPending = useRef(false);
  const nextX = useRef(0);
  const nextY = useRef(0);

  // Respect the user's OS-level motion preference. We read it once on mount
  // *and* subscribe to changes — users can flip the toggle in System Settings
  // mid-session and we should stop the effect immediately.
  const reducedMotion = useRef(false);

  useEffect(() => {
    // `matchMedia` + the `change` event is the standard way to track this
    // preference. `addEventListener("change", ...)` is the modern API; the
    // older `addListener` is deprecated.
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mql.matches;

    const onChange = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  /**
   * Mouse handler. Two responsibilities:
   *  1. Translate the page-space cursor into local-to-the-wrapper pixels
   *     using `getBoundingClientRect()`. The rect's `left`/`top` are the
   *     wrapper's offset relative to the viewport; subtracting yields a
   *     coordinate inside the wrapper's box.
   *  2. Schedule a single CSS-variable write per animation frame.
   *
   * `useCallback` keeps the function reference stable across renders, which
   * is mostly a habit here — onMouseMove is bound directly to JSX so it would
   * be recreated each render anyway, but stable identity helps if someone
   * later passes it down as a prop.
   */
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion.current) return;

      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      nextX.current = e.clientX - rect.left;
      nextY.current = e.clientY - rect.top;

      if (rafPending.current) return;
      rafPending.current = true;

      // `requestAnimationFrame` schedules our DOM write to run right before
      // the browser's next paint. Multiple mousemoves between frames collapse
      // into a single style write — very efficient.
      requestAnimationFrame(() => {
        rafPending.current = false;
        const node = ref.current;
        if (!node) return;
        // `style.setProperty` is the imperative API for CSS custom properties.
        // We append `px` because the gradient consumes a length value.
        node.style.setProperty("--mx", `${nextX.current}px`);
        node.style.setProperty("--my", `${nextY.current}px`);
      });
    },
    [],
  );

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      // Initialise the CSS vars off-screen so the gradient doesn't "pop in"
      // at (0,0) before the user moves the mouse. -9999px is fine — the
      // gradient just fades to transparent.
      style={
        {
          "--mx": "-9999px",
          "--my": "-9999px",
        } as React.CSSProperties
      }
      className={cn(className)}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SpotlightCard                                                       */
/* ------------------------------------------------------------------ */

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  /**
   * Radius (in px) of the spotlight gradient. Bigger = softer light, smaller
   * = a tighter "torch" look. 400 matches the Linear feel.
   */
  radius?: number;
};

/**
 * The card itself. The DOM looks like:
 *
 *   <div class="glass relative ...">
 *     <div class="pointer-events-none absolute inset-0 ..." />   ← gradient layer
 *     <div class="relative">{children}</div>                     ← content layer
 *   </div>
 *
 * We use a real child <div> for the gradient instead of a CSS `::before`
 * pseudo-element because we need to inline-style its `background` (it
 * references the `--mx` / `--my` vars, plus the configurable `radius`). Tailwind
 * v4 supports arbitrary-value backgrounds, but inline `style` is clearer for
 * a teaching codebase.
 *
 * `pointer-events-none` on the gradient layer means hover/click goes through
 * to the content. `inset-0` is shorthand for `top:0; right:0; bottom:0; left:0`.
 */
export function SpotlightCard({
  children,
  className,
  radius = 400,
}: SpotlightCardProps) {
  return (
    <div
      className={cn(
        // `relative` so absolutely-positioned children (the glow layer)
        // anchor to *this* card, not the page.
        "glass group relative overflow-hidden rounded-2xl transition hover:bg-white/10",
        className,
      )}
    >
      {/*
        Glow layer. The gradient centre is `var(--mx) var(--my)`, which the
        SpotlightGrid wrapper updates on mousemove. Because CSS custom
        properties cascade, every card in the grid sees the *same* values
        — that's the "shared light source" effect.

        The colour stop matches our cyan accent (00f5ff) at low alpha so it
        glows without fighting the content.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-100 transition-opacity duration-300 motion-reduce:hidden"
        style={{
          background: `radial-gradient(${radius}px circle at var(--mx) var(--my), rgba(0,245,255,0.18), transparent 40%)`,
        }}
      />

      {/*
        Content layer. `relative` puts it above the absolutely-positioned
        glow without needing a z-index war.
      */}
      <div className="relative h-full">{children}</div>
    </div>
  );
}

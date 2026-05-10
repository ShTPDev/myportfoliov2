/**
 * useParallax — Framer Motion-driven parallax y-offset for an element.
 *
 * Why Framer Motion's `useScroll` + `useTransform`?
 *   They use *MotionValues* — values that don't trigger React re-renders.
 *   Updating a motion value bypasses React's render cycle and writes straight
 *   to the DOM, which is dramatically faster for scroll-driven animation.
 *
 * Concept showcase:
 *  - **MotionValue** — a Framer-Motion-managed numeric value with subscribe-
 *    based updates (no React re-render).
 *  - **`useTransform(input, [inRange], [outRange])`** — maps one motion value
 *    to another via a piecewise-linear interpolation.
 *  - **`offset` config** — controls when the target is "in view". Defaults
 *    here: animation runs from when the element's TOP enters the viewport
 *    bottom, to when its BOTTOM exits the viewport top.
 *
 * Returns a MotionValue<number>; pass it as `style={{ y }}` on a motion.div.
 */

"use client";

import { useScroll, useTransform, type MotionValue } from "framer-motion";
import type { RefObject } from "react";

export function useParallax(
  ref: RefObject<HTMLElement | null>,
  distance: number = 80,
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Map scroll progress 0→1 to y offset (-distance/2 → +distance/2).
  return useTransform(scrollYProgress, [0, 1], [-distance / 2, distance / 2]);
}

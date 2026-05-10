/**
 * Parallax — wraps children in a motion.div with a parallax y-offset driven
 * by the wrapper's scroll position.
 *
 * Use sparingly — scroll-driven animation is GPU-heavy if applied to too many
 * elements. Stick to hero backgrounds, decorative shapes, or large sections.
 *
 * Concept showcase:
 *  - **`useRef`** — stable mutable container that survives re-renders. The
 *    `.current` field can hold a DOM node. We pass it both to the JSX `ref`
 *    AND to our hook, so the hook reads the right element's scroll position.
 *  - **`HTMLDivElement`** — TS type for a real <div> DOM node.
 */

"use client";

import { useRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useParallax } from "@/hooks/useParallax";

export function Parallax({
  distance = 80,
  ...props
}: HTMLMotionProps<"div"> & { distance?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const y = useParallax(ref, distance);
  return <motion.div ref={ref} style={{ y }} {...props} />;
}

/**
 * Reveal — drop-in scroll-triggered fade + slide-in.
 *
 * Variants of FadeIn but with optional direction + delay, and renders any
 * HTML element via the `as` prop pattern.
 *
 * Concept showcase:
 *  - **Direction prop with literal union** — `"up" | "down" | "left" | "right"`.
 *  - **Inline variants** — derived from `direction` instead of a static export.
 *  - **`HTMLMotionProps<"div">`** — strongly-typed motion.div props.
 */

"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

type Direction = "up" | "down" | "left" | "right";

const offset: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 30 },
  down: { x: 0, y: -30 },
  left: { x: 30, y: 0 },
  right: { x: -30, y: 0 },
};

export function Reveal({
  direction = "up",
  delay = 0,
  amount = 0.2,
  ...props
}: HTMLMotionProps<"div"> & {
  direction?: Direction;
  delay?: number;
  amount?: number;
}) {
  const o = offset[direction];

  // Build variants per-call so each Reveal can have different direction/delay.
  const variants: Variants = {
    hidden: { opacity: 0, x: o.x, y: o.y },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      {...props}
    />
  );
}

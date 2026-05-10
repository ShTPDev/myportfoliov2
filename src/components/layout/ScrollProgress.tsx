/**
 * ScrollProgress — thin gradient bar at the top of the page tracking scroll.
 *
 * Concept showcase:
 *  - **`useScroll` from framer-motion** — page-level motion value `scrollYProgress`
 *    in [0, 1].
 *  - **`scaleX` transform** — scale a 100%-wide bar from 0→1 left to right.
 *  - **`useSpring`** — smooths the bar so it doesn't jitter while scrolling.
 *  - **`transform-origin`** — bar shrinks/grows from the LEFT edge.
 */

"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  });

  return (
    <motion.div
      // origin-left so the bar fills from the left.
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-violet"
      style={{ scaleX }}
    />
  );
}

/**
 * MagneticButton — link/button that subtly pulls toward the cursor on hover.
 *
 * Pattern: a wrapper measures cursor offset relative to its own bounding box
 * and applies a small translate via Framer Motion springs. Springs interpolate
 * smoothly toward the target instead of jumping.
 *
 * Concept showcase:
 *  - **`useMotionValue` + `useSpring`** — motion values updated outside React,
 *    smoothed by a spring. Performance > useState here.
 *  - **`getBoundingClientRect()`** — DOM API that returns the element's size
 *    + position relative to the viewport.
 *  - **Generic typed event handler** — `React.MouseEvent<HTMLDivElement>`.
 */

"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MagneticButton({
  children,
  className,
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Motion values for the translate. They DON'T cause React re-renders.
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring smoothing for the magnetic pull.
  const sx = useSpring(x, { stiffness: 200, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 20, mass: 0.4 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Distance from element center.
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.div>
  );
}

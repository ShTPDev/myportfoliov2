/**
 * TiltCard — wrapper that tilts toward the cursor in 3D on hover.
 *
 * Implementation: read cursor position relative to the card, map to a small
 * rotateX/rotateY (in degrees), apply via Framer Motion springs.
 *
 * Concept showcase:
 *  - **`perspective`** + **`transformStyle: "preserve-3d"`** — the parent
 *    applies CSS perspective so children's rotateX/Y look 3D. Without it,
 *    the rotation looks flat.
 *  - **Generic-typed `useRef<HTMLDivElement>`** — TS type for the DOM node.
 */

"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Track normalized cursor position: -0.5 ... +0.5
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Smooth via springs.
  const spx = useSpring(px, { stiffness: 200, damping: 20 });
  const spy = useSpring(py, { stiffness: 200, damping: 20 });

  // Map normalized x → rotateY (left/right tilt) and y → rotateX (up/down).
  // Note rotateX is inverted: cursor near top tilts the top toward the user.
  const rotateY = useTransform(spx, [-0.5, 0.5], [-max, max]);
  const rotateX = useTransform(spy, [-0.5, 0.5], [max, -max]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
        transformStyle: "preserve-3d",
      }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}

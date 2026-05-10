/**
 * HeroBackground — animated gradient that follows the cursor.
 *
 * Approach:
 *  - `useMotionValue` for cursor x/y → updates motion values directly,
 *    bypassing React re-renders.
 *  - `useSpring` smooths the follow.
 *  - `useMotionTemplate` builds a CSS string from motion values, fed to
 *    `style.background` so the radial-gradient origin moves with cursor.
 *
 * Concept showcase:
 *  - **`useMotionTemplate`** — composes motion values into a string, like a
 *    template literal but reactive. Updates DOM without React render.
 *  - **Pointer events + cleanup** — register on the section, not window, so
 *    the effect only runs when cursor is over the hero.
 */

"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useEffect, useRef } from "react";

export function HeroBackground() {
  const ref = useRef<HTMLDivElement | null>(null);

  // Default to center of the section.
  const x = useMotionValue(50);
  const y = useMotionValue(50);

  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });

  // CSS string updated reactively. Note: % units, not px.
  const background = useMotionTemplate`radial-gradient(600px circle at ${sx}% ${sy}%, rgba(0,245,255,0.15), transparent 60%)`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      x.set(((e.clientX - rect.left) / rect.width) * 100);
      y.set(((e.clientY - rect.top) / rect.height) * 100);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <motion.div className="absolute inset-0" style={{ background }} />
      {/* Static decorative grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

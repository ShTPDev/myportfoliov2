/**
 * FloatingIcons — decorative icons that drift up/down on a loop.
 *
 * Concept showcase:
 *  - **Animated array** — keep configs in a typed array, render each with
 *    a per-item delay so they don't all bob in sync.
 *  - **`animate` prop with object shorthand** — Framer Motion accepts a plain
 *    target object (not a variant). Use `transition.repeat: Infinity` for loops.
 *  - **Position via Tailwind arbitrary values** — `top-[12%]` etc.
 */

"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  Database,
  GitBranch,
  Server,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

interface Floater {
  Icon: LucideIcon;
  className: string; // positioning + color
  delay: number;
  drift: number; // px range
  size: number;
}

const FLOATERS: readonly Floater[] = [
  { Icon: CreditCard, className: "top-[12%] left-[8%] text-accent-cyan", delay: 0, drift: 12, size: 22 },
  { Icon: Database,   className: "top-[20%] right-[10%] text-accent-violet", delay: 0.4, drift: 16, size: 26 },
  { Icon: Smartphone, className: "bottom-[18%] left-[12%] text-accent-blue", delay: 0.8, drift: 14, size: 22 },
  { Icon: Server,     className: "bottom-[22%] right-[14%] text-accent-cyan", delay: 1.2, drift: 18, size: 24 },
  { Icon: GitBranch,  className: "top-[44%] left-[42%] text-accent-violet", delay: 1.6, drift: 10, size: 20 },
];

export function FloatingIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 hidden sm:block">
      {FLOATERS.map(({ Icon, className, delay, drift, size }, i) => (
        <motion.div
          key={i}
          className={`absolute opacity-30 ${className}`}
          animate={{ y: [0, -drift, 0] }}
          transition={{
            duration: 4 + i * 0.3,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon size={size} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * LivePulse — the tiny animated "I'm alive" status dot.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  WHY THIS FILE EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 *  Framer Motion runs in the browser. Anything that calls `motion.<X>` with
 *  an `animate` prop must execute on the client, because the animation loop
 *  needs `requestAnimationFrame`, which only exists in the browser.
 *
 *  Next.js App Router renders everything as a Server Component by default
 *  (faster, less JS shipped). To opt a single component into client-side
 *  hydration we add the `"use client"` directive at the very top of the file.
 *
 *  The trick: keep the client surface AS SMALL AS POSSIBLE. Only the dot is
 *  animated — the rest of the status strip (labels, values, layout) stays on
 *  the server. This is the "client island" pattern: a small interactive
 *  bubble inside an otherwise static, server-rendered tree.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  TS / REACT CONCEPTS DEMONSTRATED
 * ─────────────────────────────────────────────────────────────────────────────
 *  - `"use client"` directive — file boundary that flips a component into a
 *    Client Component. Everything imported below becomes part of the client
 *    JS bundle.
 *  - **Discriminated union via literal types** — the `tone` prop is
 *    `"green" | "amber"`. TS narrows on it inside the `colorClass` lookup.
 *  - **`Readonly<T>`-style props pattern** — we type props as a plain object;
 *    React already treats props as read-only at runtime (mutating them is a
 *    bug), but spelling the contract out helps the reader.
 *  - Framer Motion `animate` arrays: passing an array like `[1, 1.4, 1]`
 *    tells Framer to keyframe through those values over `duration`.
 */

"use client";

import { motion } from "framer-motion";

// `Tone` is a *literal union type*. The compiler will only let callers pass
// one of the two strings — typos become compile errors instead of silent
// runtime weirdness.
export type Tone = "green" | "amber";

// `Record<Tone, string>` is the TS utility type that says: "an object whose
// keys are exactly the members of `Tone`, and whose values are strings".
// If we ever add a new tone (e.g. "red"), TS will force us to fill it in here.
const COLOR: Record<Tone, { core: string; halo: string }> = {
  green: {
    // Tailwind's `bg-emerald-400` is a vivid "all good" green.
    core: "bg-emerald-400",
    halo: "bg-emerald-400/40",
  },
  amber: {
    // `amber-400` = "stale / degraded but not down" — same color codebase
    // uses on Vercel/Stripe status pages.
    core: "bg-amber-400",
    halo: "bg-amber-400/40",
  },
};

/**
 * `LivePulse` renders a small dot with a halo that breathes (scale up,
 * fade, scale back down) on a 2-second loop.
 *
 * The dot is positioned `relative`; the halo is an absolutely-positioned
 * sibling that sits behind the dot and animates. Two layers means the
 * solid dot stays crisp while the halo does the visual breathing.
 */
export function LivePulse({ tone = "green" }: { tone?: Tone }) {
  const c = COLOR[tone];

  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
      {/*
        Halo — the breathing ring. `motion.span` lets us animate its
        `scale` and `opacity` together. Framer interpolates between each
        keyframe in the array over `duration` seconds, then loops because
        `repeat: Infinity`.

        `aria-hidden` because this is purely decorative; the meaning is
        already conveyed by the cell's text label ("All systems operational").
      */}
      <motion.span
        aria-hidden
        className={`absolute inline-flex h-full w-full rounded-full ${c.halo}`}
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Core dot — solid, no animation. */}
      <span
        aria-hidden
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${c.core}`}
      />
    </span>
  );
}

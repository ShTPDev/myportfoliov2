/**
 * Hero — top-of-homepage section with animated headline + CTA buttons.
 *
 * Why `"use client"`?
 *   Framer Motion is a client-only library — it uses browser APIs
 *   (requestAnimationFrame, IntersectionObserver) that don't exist on the
 *   server. Adding `"use client"` at the top tells Next.js to render this
 *   component on the client. EVERY component imported by a client component
 *   is also treated as client.
 *
 * Animation flow:
 *   - The wrapper uses `variants={stagger}` and animates from "hidden" → "show".
 *   - Each child (badge, h1, p, button row) inherits those state names and
 *     uses `variants={fadeInUp}`, so the parent's stagger config makes them
 *     animate in one after another.
 *   - `initial="hidden" animate="show"` triggers the animation on mount
 *     (vs. `whileInView` which triggers on scroll).
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeInUp, stagger } from "@/lib/animations";

export function Hero() {
  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-24 pt-20 sm:pt-28">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center text-center"
      >
        <motion.span
          variants={fadeInUp}
          className="glass mb-6 rounded-full px-4 py-1.5 font-mono text-xs text-foreground-muted"
        >
          Belize · full-stack systems · marketplace + payments
        </motion.span>

        <motion.h1
          variants={fadeInUp}
          // `text-balance` (Tailwind v4) hints the browser to balance line
          // wrapping for nicer headline shapes on multi-line titles.
          className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl"
        >
          I build <span className="text-gradient">scalable commerce</span>{" "}
          systems for Belize.
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mt-5 max-w-xl text-balance text-base text-foreground-muted sm:text-lg"
        >
          Marketplaces, payment gateways, runner logistics — production-grade
          infrastructure built end-to-end.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/projects"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
          >
            View Projects
          </Link>
          <Link
            href="/contact"
            className="glass rounded-full px-6 py-3 text-sm font-medium text-foreground transition hover:bg-white/10"
          >
            Get in touch
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

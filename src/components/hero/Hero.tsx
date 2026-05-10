/**
 * Hero — top-of-homepage section.
 *
 * Phase 3 upgrades:
 *  - HeroBackground (mouse-tracked radial gradient)
 *  - FloatingIcons (subtle drift loop)
 *  - AnimatedTitle (per-word stagger reveal)
 *  - MagneticButton wrapping the primary CTA
 *
 * Why all this is in a client component:
 *   Every effect here needs the browser — pointer events, animation timers,
 *   bounding rects. So `"use client"` at top.
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeInUp, stagger } from "@/lib/animations";
import { HeroBackground } from "./HeroBackground";
import { FloatingIcons } from "./FloatingIcons";
import { AnimatedTitle } from "./AnimatedTitle";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Hero() {
  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
      <HeroBackground />
      <FloatingIcons />

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

        <AnimatedTitle
          text="I build scalable commerce systems for Belize."
          highlight="commerce"
          className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl"
        />

        <motion.p
          variants={fadeInUp}
          className="mt-5 max-w-xl text-balance text-base text-foreground-muted sm:text-lg"
        >
          Marketplaces, payment gateways, runner logistics — production-grade
          infrastructure built end-to-end.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <MagneticButton>
            <Link
              href="/projects"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              View Projects
            </Link>
          </MagneticButton>
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

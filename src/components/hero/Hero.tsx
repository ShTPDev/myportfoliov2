/**
 * Hero — top-of-homepage section.
 *
 * Copy aligned to the IT Manager pitch (BGLL application, May 2026):
 *   - 5+ yrs progressive IT
 *   - Sole IT authority at Belize Social Investment Fund (BSIF)
 *   - Founder of M3M3 Development; shipped M3 Marketplace (287K LOC) on GCP
 *   - Built Belize Bank payment integration in production
 *
 * Phase 3 animation stack (kept intact):
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
import { ResumeButton } from "@/components/layout/ResumeButton";

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
          Belmopan, Belize · IT Manager · Full-Stack Engineer
        </motion.span>

        {/*
          AnimatedTitle splits the string by spaces and applies the gradient
          class to any word that contains `highlight`. Picking "systems" so
          the brand-coloured word lands on the noun the rest of the sentence
          is anchored to.
        */}
        <AnimatedTitle
          text="I run IT operations and ship production systems for Belize."
          highlight="systems"
          className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl"
        />

        <motion.p
          variants={fadeInUp}
          className="mt-5 max-w-xl text-balance text-base text-foreground-muted sm:text-lg"
        >
          5+ years of progressive IT experience. Currently the sole IT
          authority at the Belize Social Investment Fund and founder of M3M3
          Development — where I led the team that shipped the 287K-LOC M3
          Marketplace on GCP, with Stripe, PayPal, and the Belize Bank
          payment gateway (any card, any issuer) live in production.
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
              View work
            </Link>
          </MagneticButton>
          <Link
            href="/contact"
            className="glass rounded-full px-6 py-3 text-sm font-medium text-foreground transition hover:bg-white/10"
          >
            Get in touch
          </Link>
          {/*
            Résumé download — small pill matching the navbar CTA size. Has a
            keyboard shortcut (`r`) wired up inside the component itself.
          */}
          <ResumeButton size="sm" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * Hero — top-of-homepage section.
 *
 * Copy aligned to the IT Manager pitch (BGLL application, May 2026):
 *   - 5+ yrs progressive IT
 *   - Sole IT authority at Belize Social Investment Fund (BSIF)
 *   - Founder of M3M3 Development; shipped M3 Marketplace (287K LOC) on GCP
 *   - Built Belize Bank payment integration in production
 *
 * UX-pass changes (May 2026 polish):
 *   - Pitch tightened from 4 sentences (~85 words) to 1 punch + 1 proof
 *     line. Premium SaaS sites lead with one sentence. Beginners over-explain;
 *     this version trusts the reader to click through if they want depth.
 *   - CTA row reordered: "View work" + "Résumé" are now the two primary
 *     pills (same size, side-by-side). "Get in touch" demoted to a muted
 *     text link — still reachable, but doesn't compete with the work +
 *     résumé pair that hiring managers scan first.
 *   - FloatingIcons removed entirely. The hero had FOUR simultaneous
 *     motion systems (HeroBackground gradient, FloatingIcons drift,
 *     AnimatedTitle stagger, MagneticButton pull). Premium SaaS sites
 *     limit to 1-2. Dropping the drifting icons keeps the hero feeling
 *     "alive" without the kitchen-sink feel. The component file is left
 *     in place so it can be reintroduced later without git archaeology.
 *
 * Phase 3 animation stack (kept):
 *  - HeroBackground (mouse-tracked radial gradient)
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
import { AnimatedTitle } from "./AnimatedTitle";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ResumeButton } from "@/components/layout/ResumeButton";

export function Hero() {
  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
      <HeroBackground />

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
          Belmopan, Belize · IT Manager · Software Engineer
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

        {/*
          Pitch — punch line + proof line. Each is its own short sentence
          (under 60 words combined). Beginners often try to cram everything
          into the hero; the rest of the homepage handles depth, this is
          just the elevator pitch.
        */}
        <motion.p
          variants={fadeInUp}
          className="mt-5 max-w-xl text-balance text-base text-foreground-muted sm:text-lg"
        >
          IT Manager and software engineer. I run BSIF&apos;s IT and ship a
          live 287K-LOC marketplace on GCP. Open to IT Manager or Software
          Engineering roles in Belize.
        </motion.p>

        {/*
          CTA row — three slots:
            1. View work (primary, magnetic): the loudest action. Solid
               foreground/background pill so it reads as the default click.
            2. Résumé (primary, glass pill): same size as View work via the
               `size="md"` prop on ResumeButton. Side-by-side pair gives
               hiring managers a clear "see the work / read the résumé"
               choice without making them hunt for the PDF.
            3. Get in touch (muted text link): the underlined-ish secondary.
               Still keyboard-reachable, but visually quieter so it doesn't
               steal clicks from the two primary actions.
        */}
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

          {/*
            ResumeButton is OWNED by the layout module — we DON'T modify
            its file. The `size="md"` variant (px-5 py-2.5 text-sm in
            ResumeButton's own class table) is the closest match to View
            work's px-6 py-3 text-sm so the pair reads as one unit.
          */}
          <ResumeButton size="md" />

          {/*
            "Get in touch" demoted from a glass pill to a muted text link.
            Underline-on-hover is the standard secondary-link affordance;
            the ml-1 sm:ml-2 nudges it slightly away from the Résumé pill
            on horizontal layouts so the trio doesn't read as three buttons.
          */}
          <Link
            href="/contact"
            className="text-sm font-medium text-foreground-muted underline-offset-4 transition hover:text-foreground hover:underline sm:ml-2"
          >
            Get in touch
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * `/projects` route — deep dive on the four production systems.
 *
 * Where the homepage's `EcosystemShowcase` is a compact 2-column grid (a
 * "bento" preview), this page is the long-form case-study version: one
 * project per row, more breathing room, full descriptions front and center.
 *
 * Concept showcase:
 *  - **Next.js App Router file-based routing** — placing `page.tsx` under
 *    `src/app/projects/` automatically creates the `/projects` URL. No
 *    router config needed. (See
 *    `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
 *    for the full routing model.)
 *  - **Server Component by default** — App Router pages are server components
 *    unless they declare `"use client"`. This file has no client directive
 *    and no hooks, so it renders on the server: faster TTFB, no JS shipped
 *    for this code, smaller bundle. The interactive bits (Reveal, TiltCard)
 *    are client components and Next.js stitches the boundary for us.
 *  - **`export const metadata`** — Next.js reads this object and renders the
 *    appropriate `<title>` + meta tags into the page `<head>`. Because the
 *    root layout sets a `template` (`"%s — Shamar T. Patnett"`), the literal
 *    string `"Projects"` here becomes `"Projects — Shamar T. Patnett"` in
 *    the browser tab. Definition lives in `src/lib/seo.ts`.
 *  - **Reusing data** — we import `ECOSYSTEM` from `@/data/ecosystem` rather
 *    than redefining the projects. One source of truth: edit the data file
 *    and BOTH the homepage and this page update.
 *  - **Alternating Reveal direction** — for visual rhythm we flip slide-in
 *    direction every other row using a ternary on the array index. Even rows
 *    slide from the left, odd rows from the right.
 *  - **Type assertion via parameter list** — the `Direction` literal-union is
 *    enforced by TS so we can't typo "lefft" or similar.
 *
 * Layout:
 *   Section header → vertical stack of CaseStudyCard, each in glass card,
 *   wrapped in TiltCard (subtle 3D tilt, max=3) and Reveal (scroll fade-in).
 */

import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animations/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { CaseStudyCard } from "@/components/projects/CaseStudyCard";
import { ECOSYSTEM } from "@/data/ecosystem";

// `Metadata` is the typed shape Next.js expects. The `title: "Projects"`
// string flows through the root layout's title template (`"%s — ..."`)
// from `src/lib/seo.ts`, producing `"Projects — Shamar T. Patnett"` in the
// browser tab. Per-page `metadata` overrides only the fields it sets — every
// other field (description, openGraph, etc.) inherits from the root layout.
export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected production systems shipped end-to-end by Shamar T. Patnett — M3 Marketplace, BeliBet, TraySoft Payment Module, and the BSIF SIF IT System.",
};

export default function ProjectsPage(): React.JSX.Element {
  return (
    <Section
      eyebrow="Selected work"
      title="Production systems I've shipped."
      description="End-to-end ownership of every system below — from architecture and code through deployment and operations. As the sole IT authority at the Belize Social Investment Fund and the founder of M3M3 Development, each project here is something I designed, built, and put into production myself or alongside a team I led."
    >
      {/*
        Vertical stack of full-width case studies. `space-y-8` adds an 8-step
        gap between siblings — equivalent to writing `mt-8` on every child
        except the first. Cleaner than per-child margins.
      */}
      <div className="space-y-8">
        {ECOSYSTEM.map((entry, i) => {
          // Alternate slide-in direction for rhythm. Even rows enter from the
          // left, odd rows from the right. The `as const` style isn't needed
          // here because Reveal's `direction` prop is already typed —
          // TypeScript will reject anything outside `"left" | "right" | ...`.
          const direction = i % 2 === 0 ? "left" : "right";

          return (
            // `key` must be stable + unique. `entry.kind` works because the
            // EcosystemKind union is unique-per-entry.
            <Reveal key={entry.kind} direction={direction} amount={0.15}>
              {/*
                TiltCard with `max={3}` gives a much subtler 3D tilt than the
                homepage cards (which use 4). On big single-column cards a
                small tilt feels premium; a big tilt feels gimmicky.
              */}
              <TiltCard max={3}>
                {/*
                  `glass` is a custom utility defined in globals.css — frosted
                  blur + translucent background + 1px ring. `rounded-2xl`
                  matches the radius of the homepage cards so the visual
                  language stays consistent. Larger padding (`p-6 md:p-8`)
                  because case-study cards are bigger.
                */}
                <article className="glass rounded-2xl p-6 md:p-8">
                  <CaseStudyCard entry={entry} />
                </article>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

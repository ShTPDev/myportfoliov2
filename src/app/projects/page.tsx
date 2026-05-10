/**
 * `/projects` route — Apple-style scroll-locked case studies.
 *
 * Where the homepage's `EcosystemShowcase` is a compact 2-column "bento"
 * preview of the four production systems, this page is the long-form
 * scroll-storytelling version: one project per tall section, with a
 * sticky visual on the left and content advancing on the right.
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
 *    for this code, smaller bundle. The interactive bits live inside
 *    `StickyCaseStudy` (a client component) — Next.js stitches the
 *    server/client boundary for us automatically.
 *  - **`export const metadata`** — Next.js reads this object and renders the
 *    appropriate `<title>` + meta tags into the page `<head>`. Because the
 *    root layout sets a title template (`"%s — Shamar T. Patnett"`), the
 *    literal string `"Projects"` here becomes
 *    `"Projects — Shamar T. Patnett"` in the browser tab. Definition lives
 *    in `src/lib/seo.ts`.
 *  - **Reusing data** — we import `ECOSYSTEM` from `@/data/ecosystem` rather
 *    than redefining the projects. One source of truth: edit the data file
 *    and BOTH the homepage and this page update.
 *
 * Layout strategy:
 *   Page header (Section eyebrow/title/description) → sticky scroll-spy
 *   `ProjectNav` chip strip → vertical stack of `StickyCaseStudy` sections,
 *   one per ECOSYSTEM entry. Each section is its own scroll-locked block;
 *   CSS `position: sticky` naturally hands off from one section to the next
 *   as the user scrolls.
 */

import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { StickyCaseStudy } from "@/components/projects/StickyCaseStudy";
import { ProjectNav } from "@/components/projects/ProjectNav";
import { ECOSYSTEM } from "@/data/ecosystem";

// `Metadata` is the typed shape Next.js expects. The `title: "Projects"`
// string flows through the root layout's title template (`"%s — ..."`)
// from `src/lib/seo.ts`, producing `"Projects — Shamar T. Patnett"` in the
// browser tab. Per-page `metadata` overrides only the fields it sets — every
// other field (description, openGraph, etc.) inherits from the root layout.
export const metadata: Metadata = {
  title: "Projects",
  description:
    "Production systems and active builds by Shamar T. Patnett — M3 Marketplace (live on GCP), TraySoft Payment Module, the BSIF SIF IT System, BeliBet, BelizeHomes, M3 Inventory Manager, and Caribbean Bridges.",
};

export default function ProjectsPage(): React.JSX.Element {
  return (
    <Section
      eyebrow="Selected work"
      title="Production systems I've shipped."
      description="End-to-end ownership of every system below — from architecture and code through deployment and operations. As the sole IT authority at the Belize Social Investment Fund and the founder of M3M3 Development, each project here is something I designed, built, and put into production myself or alongside a team I led."
    >
      {/*
        Sticky scroll-spy nav. We pre-compute the chip list on the server
        (this page IS a server component) — no need to ship the data array
        to the client. The `ProjectNav` itself is a client component (it
        uses IntersectionObserver), and Next.js handles the boundary.

        `accentClass` is reused as the chip's tone-dot class so the strip
        doubles as a colour legend for the page.
      */}
      <ProjectNav
        items={ECOSYSTEM.map((e) => ({
          slug: e.slug,
          label: e.title,
          tone: e.accentClass,
        }))}
      />

      {/*
        Vertical stack of scroll-locked case studies. Each `StickyCaseStudy`
        sizes itself to its right column (sticky panel pins for that
        duration), so we don't have a fixed `min-h` anymore.

        `space-y-16` (md+ `space-y-20`) adds generous gap between siblings —
        gives the eye a beat between sections so they don't bleed together.
      */}
      <div className="space-y-16 md:space-y-20">
        {ECOSYSTEM.map((entry) => {
          // ── Server → Client boundary note ──
          // This page is a Server Component. `StickyCaseStudy` is a Client
          // Component (it uses Framer Motion hooks). Across that boundary,
          // React's serialization protocol can only ferry plain data — NOT
          // functions/components. `entry.icon` IS a component, so we strip
          // it here using object rest destructuring:
          //
          //   const { icon, ...rest } = entry;
          //
          // The `_icon` underscore-prefix is a TS convention saying "we know
          // we're not using this, please don't warn". `serializable` is what
          // crosses the boundary — fully JSON-friendly. The client component
          // re-resolves the right icon by `kind` on its side.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { icon: _icon, ...serializable } = entry;
          return (
            // `key` must be stable + unique. `entry.slug` is unique per
            // entry (and matches the section's `id` for the scroll-spy
            // nav), so it's safer than `entry.kind` if we ever introduce
            // two projects of the same kind.
            <StickyCaseStudy key={entry.slug} entry={serializable} />
          );
        })}
      </div>
    </Section>
  );
}

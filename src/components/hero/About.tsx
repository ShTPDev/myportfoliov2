/**
 * About — bio + skill grid with scroll reveals.
 *
 * Phase 3 upgrade: each skill card now reveals with a per-item delay as the
 * grid scrolls into view. The Reveal component handles the IntersectionObserver
 * for us — fires once at 20% visible.
 */

import { Section } from "@/components/ui/Section";
import { SkillCard } from "@/components/ecosystem/SkillCard";
import { Reveal } from "@/components/animations/Reveal";
import { SKILLS } from "@/data/skills";

export function About() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title="IT Manager and full-stack engineer based in Belize."
      description="Five-plus years of progressive IT experience across operations, infrastructure, and software delivery — currently the sole IT authority at the Belize Social Investment Fund and founder of M3M3 Development."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <Reveal direction="left" className="md:col-span-2">
          {/*
            Bio paragraph. Keeping it dense but readable: lead with the IT
            Manager scope (BSIF), then the dev-team leadership (M3M3), then
            the relevant industry experience (BeliBet → gambling) and the
            credential. `&apos;` is the JSX-safe escape for an apostrophe.
          */}
          <p className="text-foreground-muted">
            Since August 2024 I&apos;ve held the full IT Manager scope at
            BSIF — networks, endpoints, servers, vendors, and users — as the
            organisation&apos;s sole IT authority. In parallel I founded M3M3
            Development (registered March 2025) and led the team that shipped
            the M3 Marketplace: 287K lines of production code, 87 REST APIs,
            91 backend services, 418 data models, deployed on GCP with a live
            Belize Bank payment integration. I also built BeliBet, a sports
            betting platform — direct gambling-industry exposure. B.Sc. in
            Computer Science from Edinburgh Napier University.
          </p>
        </Reveal>
        <div className="md:col-span-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SKILLS.map((s, i) => (
            // Per-item delay creates a cascade as the grid scrolls in.
            // Modulo wraps the delay so later items don't lag too much.
            <Reveal key={s.name} delay={(i % 4) * 0.08}>
              <SkillCard skill={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

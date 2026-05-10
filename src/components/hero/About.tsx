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
      title="Systems engineer focused on Belize commerce."
      description="I design, build, and operate the full stack — from mobile apps to the Linux boxes that run the backend — so businesses in Belize can run on infrastructure they own."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <Reveal direction="left" className="md:col-span-2">
          <p className="text-foreground-muted">
            My focus: payments, marketplaces, and runner logistics. I&apos;ve
            shipped systems end-to-end — Flutter clients, Serverpod backends,
            Postgres schemas, WireGuard meshes, and the CI that ties it
            together.
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

/**
 * About — bio + skill grid.
 *
 * Server Component. Pure data + JSX, no event handlers or browser APIs.
 *
 * Layout:
 *  - <Section /> primitive provides spacing + heading.
 *  - 2-column grid: copy on left, skills bento on right (stacks on mobile).
 */

import { Section } from "@/components/ui/Section";
import { SkillCard } from "@/components/ecosystem/SkillCard";
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
        <div className="md:col-span-2">
          <p className="text-foreground-muted">
            My focus: payments, marketplaces, and runner logistics. I&apos;ve
            shipped systems end-to-end — Flutter clients, Serverpod backends,
            Postgres schemas, WireGuard meshes, and the CI that ties it
            together.
          </p>
        </div>
        <div className="md:col-span-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SKILLS.map((s) => (
            <SkillCard key={s.name} skill={s} />
          ))}
        </div>
      </div>
    </Section>
  );
}

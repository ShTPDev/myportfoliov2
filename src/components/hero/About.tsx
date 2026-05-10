/**
 * About — bio + skill matrix grouped by category.
 *
 * Why grouped instead of one card per skill?
 *   With 35 real skills, a 2-column "card per skill" grid stretched 18 rows
 *   tall and dwarfed the bio. Grouping by `SkillCategory` collapses the
 *   matrix to ~7 short blocks of pills — same information, ~70% less height.
 *
 * Concept showcase:
 *  - **Grouping data with `Map<K, V>`** — we walk `SKILLS` once and bucket
 *    each into a Map keyed by category. `Map` preserves insertion order, so
 *    categories appear in the order they're first seen in the data.
 *  - **`for...of` with destructuring** — readable alternative to `.reduce`.
 *  - **`Array.from(map.entries())`** — convert the Map back to an array so
 *    we can `.map()` over it inside JSX.
 *  - The Reveal cascade still fires per category, not per skill.
 */

import { Section } from "@/components/ui/Section";
import { SkillCategoryGroup } from "@/components/ecosystem/SkillCategoryGroup";
import { Reveal } from "@/components/animations/Reveal";
import { SKILLS, type Skill, type SkillCategory } from "@/data/skills";

// Bucket skills by category. `Map<SkillCategory, Skill[]>` keeps insertion
// order, so categories show up in the order they first appear in skills.ts.
function groupByCategory(
  skills: readonly Skill[],
): ReadonlyMap<SkillCategory, Skill[]> {
  const map = new Map<SkillCategory, Skill[]>();
  for (const skill of skills) {
    const bucket = map.get(skill.category);
    if (bucket) {
      bucket.push(skill);
    } else {
      map.set(skill.category, [skill]);
    }
  }
  return map;
}

// Computed once at module load — SKILLS is static, so this is essentially
// a build-time transformation. No need to recompute per render.
const GROUPED = groupByCategory(SKILLS);

export function About() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title="IT Manager and full-stack engineer based in Belize."
      description="Five-plus years of progressive IT experience across operations, infrastructure, and software delivery — currently the sole IT authority at the Belize Social Investment Fund and founder of M3M3 Development."
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-8">
        <Reveal direction="left" className="md:col-span-2">
          {/*
            Bio paragraph. Lead with IT Manager scope (BSIF), then dev-team
            leadership (M3M3), then industry-relevant experience (BeliBet),
            then credential. `&apos;` is the JSX-safe escape for `'`.
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
          <p className="mt-3 text-xs text-foreground-muted/70">
            Hover any skill chip for context.
          </p>
        </Reveal>

        {/*
          Right column: 1-column on small screens, 2-column from md up so
          short categories pair up and the section doesn't get tall. The
          `Array.from(GROUPED)` turns the Map's entries into a real array so
          we can `.map` inside JSX.
        */}
        <div className="md:col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {Array.from(GROUPED).map(([category, skills], i) => (
            <Reveal key={category} delay={(i % 4) * 0.06}>
              <SkillCategoryGroup category={category} skills={skills} />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

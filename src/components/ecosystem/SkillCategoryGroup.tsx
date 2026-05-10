/**
 * SkillCategoryGroup — compact category block: heading + wrap of skill pills.
 *
 * Why this exists:
 *   The original About section rendered every skill as its own card, two per
 *   row. With 35 skills that produced an 18-row tower that overwhelmed the
 *   bio. This component collapses each category into ONE block, with skill
 *   names rendered as small wrapping pills. Same data, far less vertical
 *   real estate.
 *
 * Concept showcase:
 *  - **Reading from a typed data source** — we import `Skill` and `SkillCategory`
 *    from `@/data/skills` rather than redefining the shape, so the UI stays
 *    in lockstep with the data file.
 *  - **`title` attribute on a span** — quick native browser tooltip without
 *    pulling in a tooltip library. Accessibility note below: native `title`
 *    is keyboard-reachable but not great on mobile; for richer tooltips a
 *    proper `aria-describedby` + custom popover would be the next step.
 *  - **`Readonly<...>` on the props** — signals callers that we never mutate
 *    the array; safer than a plain `Skill[]`.
 */

import type { Skill, SkillCategory } from "@/data/skills";

export function SkillCategoryGroup({
  category,
  skills,
}: {
  category: SkillCategory;
  skills: Readonly<Skill[]>;
}) {
  return (
    <div>
      {/* Category header — small, mono-cased, gold/cyan accent. */}
      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan">
        {category}
      </h3>

      {/* Pill row. `flex-wrap` lets the chips reflow naturally as the column
          width changes. `gap-1.5` gives breathing room without bloating
          vertical height. */}
      <ul className="flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <li
            key={s.name}
            // `title={s.description}` puts the longer skill description into
            // the browser's built-in hover tooltip. Cheap UX win, zero JS.
            title={s.description}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-foreground transition hover:border-accent-cyan/40 hover:bg-white/10"
          >
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

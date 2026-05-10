/**
 * SkillCard — small chip-style card showing a single skill.
 *
 * Used inside the About section's bento grid. Server-renderable (no animation
 * here — animation is handled by parent fade/stagger wrappers if any).
 *
 * Concept showcase:
 *  - Component takes a typed `Skill` from the data module — single source of
 *    truth, no drift between data shape and UI.
 */

import type { Skill } from "@/data/skills";

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="glass flex flex-col gap-1 rounded-xl px-4 py-3 transition hover:-translate-y-0.5 hover:bg-white/10">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {skill.name}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
          {skill.category}
        </span>
      </div>
      <p className="text-xs text-foreground-muted">{skill.description}</p>
    </div>
  );
}

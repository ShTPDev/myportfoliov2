/**
 * EcosystemCard — large card for one M3 product (Marketplace, Runner, etc).
 *
 * Concept showcase:
 *  - **Component takes a typed entry** — single source of truth (data file).
 *  - **`Icon = entry.icon`** — re-bind to capitalized local so JSX accepts it.
 *  - **Conditional rendering with `.map()`** — render lists with stable keys.
 *
 * Hover effect: handled by parent TiltCard / Reveal — this component focuses
 * on layout + content.
 */

import type { EcosystemEntry } from "@/data/ecosystem";

export function EcosystemCard({ entry }: { entry: EcosystemEntry }) {
  const Icon = entry.icon;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-4">
        <div
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${entry.accentClass}`}
        >
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            {entry.title}
          </h3>
          <p className="mt-1 text-sm text-foreground-muted">{entry.tagline}</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-foreground-muted">
        {entry.description}
      </p>

      {/* Tech stack chips */}
      <ul className="mt-5 flex flex-wrap gap-2">
        {entry.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground-muted"
          >
            {tech}
          </li>
        ))}
      </ul>

      {/* Metrics row pinned to bottom of card */}
      <div className="mt-auto grid grid-cols-3 gap-3 pt-6">
        {entry.metrics.map((m) => (
          <div key={m.label} className="border-t border-white/10 pt-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
              {m.label}
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {m.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * TechStackStrip — "Hit the ground running on:" tech-keyword chip row.
 *
 * Why it exists:
 *   Recruiters skim portfolios for keyword matches against the JD. Surfacing
 *   the actual tech stack (Flutter, Dart, Postgres, Stripe, Belize Bank, …)
 *   as a single glanceable strip near the top of /services makes that
 *   matching trivial without forcing them to dig through case studies.
 *
 * Server-renderable:
 *   No `"use client"`. No state, no effects — it's a static block that just
 *   renders chips from a typed array.
 *
 * Concept showcase:
 *  - **Local typed data with `as const`** — the chip list is declared as a
 *    tuple-of-objects with `as const`, so TS preserves each `label`'s
 *    literal string type. We don't need to share this data with anyone, so
 *    co-locating it with the consumer (instead of putting it under
 *    `src/data/`) is the right call.
 *  - **Discriminated marker via boolean field** — `academic?: true` on a
 *    chip flags the technologies we list as "from coursework, not
 *    production work". The UI renders a footnote asterisk for those so we
 *    don't overstate the experience.
 *  - **Tailwind chip pattern** — same pill shape we use in
 *    `SkillCategoryGroup`, so the visual language stays consistent.
 */

interface TechChip {
  /** Display label as it appears on the chip. */
  readonly label: string;
  /**
   * `true` if this technology came from coursework / academic projects only,
   * not production work. Renders an asterisk; the strip explains the marker
   * in a small footnote. Optional — omitted on production-grade chips.
   */
  readonly academic?: true;
}

/**
 * Curated 14-chip tech list. Order goes:
 *   1. Mobile / app stack (what M3M3 actually ships in)
 *   2. Backend + data layer
 *   3. Cloud / infra
 *   4. Payments / integrations
 *   5. IT-Operations stack
 *   6. * Academic ramp (Angular, Groovy)
 *
 * Stays under 15 chips on purpose — beyond that the strip starts to feel
 * like a wishlist. If we need to enumerate more, that lives in /about under
 * the SKILLS data.
 */
const TECH_CHIPS: readonly TechChip[] = [
  { label: "Flutter" },
  { label: "Dart" },
  { label: "Serverpod" },
  { label: "PostgreSQL" },
  { label: "Redis" },
  { label: "Docker" },
  { label: "Google Cloud" },
  { label: "Stripe" },
  { label: "PayPal" },
  { label: "Belize Bank Gateway" },
  { label: "Active Directory" },
  { label: "SQL Server" },
  // `as const` forces these to literal `true`; without it TS would widen to
  // `boolean` and lose the marker semantics.
  { label: "Angular", academic: true },
  { label: "Groovy", academic: true },
] as const;

export function TechStackStrip() {
  // Pre-compute whether ANY chip carries the academic marker so we only
  // render the footnote when it's relevant. `Array.prototype.some` returns
  // `true` on the first match.
  const hasAcademicChips = TECH_CHIPS.some((c) => c.academic);

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        {/* Eyebrow label — same mono cyan we use everywhere else for tags. */}
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-cyan">
          Hit the ground running on
        </span>

        <ul className="flex flex-1 flex-wrap gap-1.5">
          {TECH_CHIPS.map((chip) => (
            <li
              key={chip.label}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-foreground transition hover:border-accent-cyan/40 hover:bg-white/10"
            >
              {chip.label}
              {/* Academic marker — small asterisk, same color as eyebrow. */}
              {chip.academic && (
                <span
                  aria-label="academic / coursework"
                  className="ml-1 text-accent-cyan"
                >
                  *
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Footnote — only rendered when at least one chip is marked academic. */}
      {hasAcademicChips && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-foreground-muted/80">
          * Academic / coursework — production ramp planned in first weeks.
        </p>
      )}
    </div>
  );
}

/**
 * TrackedSections — client wrapper that owns the dual-track toggle on /services.
 *
 * What it does:
 *   Renders the "As IT Manager / As Software Engineer / Both" tab strip,
 *   then re-renders its children sections (competencies grid + day-one rows)
 *   filtered by the selected track. Default is "both".
 *
 * Why a client wrapper (and not just `"use client"` on the whole page)?
 *   The /services `page.tsx` exports `metadata` (a static SEO export). If we
 *   convert the page itself to a client component, Next will refuse to build
 *   because client components can't export `metadata`. Lifting the toggle
 *   state into a small CLIENT child keeps the page a server component while
 *   still letting us hydrate just the interactive bit.
 *
 *   Docs:
 *   - node_modules/next/dist/docs/01-app/01-getting-started/06-server-and-client-components.md
 *   - node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
 *
 * Concept showcase:
 *  - **`"use client"`** — opt this file into the client bundle. Required
 *    because we use `useState` (a React hook that needs the browser).
 *  - **Lifted state** — one piece of state, two filtered lists. Both the
 *    competencies grid and the day-one rows derive from the same `track`
 *    state, so they always agree.
 *  - **Discriminated union via literal-string type** — `TabValue` is
 *    `"both" | "it" | "swe"`. TS forces the `setTab` setter to only accept
 *    one of those three strings; a typo errors at compile time.
 *  - **Pure render filtering** — we recompute the filtered arrays on every
 *    render with `Array.prototype.filter`. With only 4 services + 5 rows
 *    this is cheaper than `useMemo`, and it keeps the code obvious. React
 *    19's strict purity is satisfied because we never call `setState` or
 *    `Math.random` during render — just data transforms.
 *  - **Index alignment via `originalIndex`** — when we filter the day-one
 *    rows we keep their *original* 1-based index so badge numbering stays
 *    "01 / 02 / 03" sensibly even after rows are hidden. We could also
 *    re-number 1..N post-filter; we picked "preserve the storyline order"
 *    so reordering the source tuple doesn't drift the badges.
 */

"use client";

import { useState } from "react";
import {
  CreditCard,
  Eye,
  GitBranch,
  Settings2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/animations/Reveal";
import { CompetencyCard } from "@/components/projects/CompetencyCard";
import { DayOneRow } from "@/components/projects/DayOneRow";
import { Section } from "@/components/ui/Section";
import { SERVICES, type Service, type Track } from "@/data/services";

/**
 * Server → Client boundary: function values can't cross.
 *
 * React Server Components can serialize JSON-like values across the
 * server→client boundary, but NOT functions (which Lucide icon components
 * are). The parent page is a Server Component, so it cannot hand us an
 * `icon: LucideIcon` directly — the build refuses with "Functions cannot
 * be passed directly to Client Components".
 *
 * Workaround (also used in `StickyCaseStudy`):
 *   - The page sends a string `iconKey` instead.
 *   - We re-resolve the key → Lucide component HERE on the client side
 *     using the `ICON_BY_KEY` map below.
 *
 * `Record<DayOneIconKey, LucideIcon>` makes TS verify exhaustiveness: add a
 * new key to the union and this map fails to compile until you wire it.
 */
export type DayOneIconKey =
  | "credit-card"
  | "shield-check"
  | "settings"
  | "eye"
  | "git-branch";

const ICON_BY_KEY: Record<DayOneIconKey, LucideIcon> = {
  "credit-card": CreditCard,
  "shield-check": ShieldCheck,
  settings: Settings2,
  eye: Eye,
  "git-branch": GitBranch,
};

/**
 * Day-one row shape, exported so the parent page can statically declare the
 * tuple and have TS verify each field. `Readonly<...>` arrays mark the data
 * as immutable from the consumer side.
 */
export interface DayOneRowEntry {
  /** Headline copy — short, action-style ("Local card payments…"). */
  readonly headline: string;
  /** ≤2-sentence detail paragraph. */
  readonly detail: string;
  /** Tracks this row belongs to (e.g. payments work spans both lanes). */
  readonly track: readonly Track[];
  /** Optional concrete signal pill ("6–8 weeks", "MFA · biometric · PCI"). */
  readonly metric?: string;
  /**
   * Optional icon KEY (string), resolved to a Lucide component on the
   * client via `ICON_BY_KEY`. We use a string key rather than the component
   * itself because functions can't cross the RSC server→client boundary.
   */
  readonly iconKey?: DayOneIconKey;
}

/**
 * The toggle has 3 states. Using a literal-string union (rather than e.g.
 * a number 0/1/2) keeps the JSX self-documenting: `tab === "swe"` reads
 * better than `tab === 2`.
 */
type TabValue = "both" | "it" | "swe";

interface Tab {
  value: TabValue;
  label: string;
}

const TABS: readonly Tab[] = [
  // Order matters — we want "Both" first because it's the default and the
  // most informative view. IT then SWE matches the page's narrative arc.
  { value: "both", label: "Both" },
  { value: "it", label: "As IT Manager" },
  { value: "swe", label: "As Software Engineer" },
] as const;

/**
 * Pure helper — does this entry's track list intersect the selected tab?
 *
 * "both" is a wildcard: every entry passes. Otherwise we look for an exact
 * literal match. `Array.prototype.includes` does the membership check; TS
 * narrows `selected` to `Track` inside the else branch via control flow.
 */
function entryMatches(
  entryTracks: readonly Track[],
  selected: TabValue,
): boolean {
  if (selected === "both") return true;
  // `selected` is now narrowed to `"it" | "swe"`, both of which are valid
  // members of the `Track` union.
  return entryTracks.includes(selected);
}

/**
 * Index-aligned competency examples. Same data the parent page used to
 * pass directly into `<CompetencyCard>`; we accept it as a prop so the
 * page stays the single source of truth for editorial copy.
 */
export type CompetencyExamples = readonly string[];

export function TrackedSections({
  competencyExamples,
  dayOneRows,
}: {
  competencyExamples: CompetencyExamples;
  dayOneRows: readonly DayOneRowEntry[];
}) {
  // `useState<TabValue>("both")` initialises the state and types the setter
  // so only one of our three literal strings can be passed in.
  const [tab, setTab] = useState<TabValue>("both");

  /**
   * Filter the competencies grid. We pair each `Service` with its
   * editorial `example` BEFORE filtering so we never lose alignment between
   * the two arrays. `map` to pair, then `filter` to drop the misses.
   *
   * `service: Service` is typed explicitly to make the contract obvious in
   * a beginner-friendly way; TS would also infer it.
   */
  const visibleCompetencies: readonly {
    service: Service;
    example: string | undefined;
    originalIndex: number;
  }[] = SERVICES.map((service, i) => ({
    service,
    example: competencyExamples[i],
    originalIndex: i,
  })).filter(({ service }) => entryMatches(service.track, tab));

  /**
   * Filter the day-one rows the same way. We capture the original 1-based
   * index up front so the badge stays "01 / 02 / 03 ..." in source order
   * even after some rows are hidden.
   */
  const visibleDayOne: readonly (DayOneRowEntry & { originalIndex: number })[] =
    dayOneRows
      .map((row, i) => ({ ...row, originalIndex: i + 1 }))
      .filter((row) => entryMatches(row.track, tab));

  return (
    <>
      {/* ── Toggle (tab strip) ─────────────────────────────────────────────
          Single-row pill group. ARIA `tablist` semantics aren't strictly
          required here because we're filtering content rather than swapping
          panels, but `role="group"` keeps screen readers grouped. */}
      <Section className="!pb-4 !pt-20 sm:!pt-24">
        <div role="group" aria-label="Filter by track" className="flex justify-center">
          <div className="glass inline-flex items-center gap-1 rounded-full p-1">
            {TABS.map((t) => {
              const active = tab === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  // `aria-pressed` on a toggle button conveys state to
                  // assistive tech without needing a full tablist setup.
                  aria-pressed={active}
                  onClick={() => setTab(t.value)}
                  className={[
                    "rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition",
                    active
                      ? "bg-foreground text-background"
                      : "text-foreground-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── Competencies (filtered) ───────────────────────────────────── */}
      <Section
        eyebrow="Services"
        title="What I deliver as IT Manager or Software Engineer."
        description="Four pillars of scope spanning both tracks — IT operations, network and infrastructure, full-stack engineering, and payments + security — each backed by production work shipped at BSIF and on the M3 Marketplace platform."
      >
        {visibleCompetencies.length === 0 ? (
          // Defensive empty-state. With the current data this branch never
          // fires (every track has at least one entry), but it's cheap to
          // include and keeps the component robust against future edits.
          <p className="text-sm text-foreground-muted">
            No competencies match this filter yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visibleCompetencies.map(({ service, example, originalIndex }) => (
              // `Reveal` is a client component (Framer Motion). Wrapping each
              // card in one gives us a staggered fade-in as the user scrolls;
              // `delay` cascades the entries based on their ORIGINAL position
              // so re-filtering doesn't reshuffle the animation rhythm.
              <Reveal
                key={service.title}
                delay={originalIndex * 0.08}
                className="h-full"
              >
                <CompetencyCard service={service} example={example} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      {/* ── Day-one deliverables (filtered) ───────────────────────────── */}
      <Section
        id="day-one"
        eyebrow="Day-one deliverables"
        title="What I can ship in the first weeks."
        description="Concrete outcomes — not aspirations. Each maps to work I have already executed at BSIF or shipped in production on M3 Marketplace."
      >
        {visibleDayOne.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            No deliverables match this filter yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleDayOne.map((row) => {
              // Re-resolve the string key into the actual Lucide component.
              // `undefined` if the row didn't supply an `iconKey` — the row
              // component handles that and falls back to the number badge.
              const RowIcon = row.iconKey ? ICON_BY_KEY[row.iconKey] : undefined;
              return (
                <Reveal
                  key={row.headline}
                  // `originalIndex` is 1-based; multiply by 0.06 for cascade.
                  delay={(row.originalIndex - 1) * 0.06}
                >
                  <DayOneRow
                    index={row.originalIndex}
                    headline={row.headline}
                    detail={row.detail}
                    metric={row.metric}
                    icon={RowIcon}
                  />
                </Reveal>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}

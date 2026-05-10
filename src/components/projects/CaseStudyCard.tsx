/**
 * CaseStudyCard — the rich, full-width case-study card used on `/projects`.
 *
 * Why this exists:
 *  - The homepage uses `EcosystemCard` inside a 2-column grid: it shows a
 *    compact summary so all four projects fit "above the fold" together.
 *  - The `/projects` route is a deeper view — one project per row, more space
 *    to breathe. This component renders the SAME `EcosystemEntry` data, but
 *    with a larger header, a footer hint, and bigger metric tiles.
 *
 * Concept showcase (read top to bottom):
 *  - **Props pattern with a typed object parameter** — we accept a single
 *    `{ entry }` prop, where `entry` is typed via `EcosystemEntry`. Keeping
 *    one parameter (an object) is the canonical React pattern; it scales as
 *    we add props later without changing call sites.
 *  - **`import type` (TS-only import)** — `EcosystemEntry` is a *type*, not a
 *    runtime value. `import type` tells TS this import is erased from the
 *    final JS bundle. Zero runtime cost.
 *  - **Server-renderable component** — there's no `"use client"` at the top,
 *    no hooks, no event handlers, no browser-only APIs. That means React can
 *    render this on the server (faster initial HTML, smaller JS bundle). The
 *    parent (`/projects/page.tsx`) wraps it in `Reveal` + `TiltCard` (both
 *    client components) — Next.js handles the server/client boundary
 *    automatically; we don't need to mark anything ourselves here.
 *  - **Component capitalization rule** — JSX requires component names to start
 *    with a capital letter (lowercase = HTML element). `entry.icon` is a
 *    lucide-react component stored in data, but JSX won't let us write
 *    `<entry.icon />`. We re-bind it to a capitalized local: `const Icon =
 *    entry.icon`. Now `<Icon />` works.
 *  - **Discriminated union narrowing** — `entry.kind` is a literal-union
 *    (`"marketplace" | "betting" | ...`). Inside `switch` (or this lookup
 *    table), TS knows exactly which strings are possible and will flag any
 *    unhandled case if you add a new kind to the union.
 *
 * Contrast with `EcosystemCard` (the homepage compact version):
 *  - Bigger icon (h-14 vs h-11) and bigger title (text-2xl vs text-xl).
 *  - Status badge in the header (computed from `entry.kind`).
 *  - Larger metric tiles (border-box per metric, not just a top border).
 *  - Footer hint line under the metrics ("Production system" etc.).
 *  - Consumes more vertical space — designed for a vertical stack, not a grid.
 */

import type { EcosystemEntry, EcosystemKind } from "@/data/ecosystem";

/**
 * Per-kind display strings.
 *
 * `Record<EcosystemKind, ...>` is a TS utility type that means "an object
 * whose KEYS are exactly the members of `EcosystemKind`". If you ever add a
 * new kind to the union in `ecosystem.ts`, TS will refuse to compile until
 * you add an entry here too — exhaustiveness for free.
 */
const STATUS_BY_KIND: Record<
  EcosystemKind,
  { label: string; tone: string; footer: string }
> = {
  marketplace: {
    label: "Live · Production",
    // Tailwind: emerald = "shipped and running" tone. `ring-1` + `ring-*` give
    // a subtle 1px outline on the badge so it reads as a pill, not a button.
    tone: "text-emerald-300 ring-emerald-300/30 bg-emerald-300/10",
    footer: "Live production system on Google Cloud.",
  },
  betting: {
    label: "Production",
    tone: "text-accent-violet ring-accent-violet/30 bg-accent-violet/15",
    footer: "Full-stack production system — directly relevant to BGLL.",
  },
  payments: {
    label: "Production-ready package",
    tone: "text-accent-cyan ring-accent-cyan/30 bg-accent-cyan/15",
    footer: "Standalone package — 543 tests, 78% coverage, QA Grade A.",
  },
  internal: {
    label: "Internal · Production",
    tone: "text-accent-blue ring-accent-blue/30 bg-accent-blue/15",
    footer: "Internal production system at the Belize Social Investment Fund.",
  },
};

// Explicit return type on exported components is teaching-worthy: it documents
// that this is a React JSX element (not, say, a string or a Promise).
export function CaseStudyCard({
  entry,
}: {
  entry: EcosystemEntry;
}): React.JSX.Element {
  // `Icon` (capitalized) is required so JSX treats it as a component, not a
  // DOM element. See the top-of-file note on "Component capitalization rule".
  const Icon = entry.icon;

  // `kind` narrows the lookup, so `status` is fully typed (no `any`, no `?`).
  const status = STATUS_BY_KIND[entry.kind];

  return (
    <div className="flex h-full flex-col">
      {/* ---------- Header: icon + title + status badge ---------- */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            // `accentClass` is per-project styling baked into the data.
            // `ring-1` adds a 1px outline (lighter than `border-1`).
            className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${entry.accentClass}`}
          >
            <Icon size={26} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {entry.title}
            </h3>
            <p className="mt-1 text-sm text-foreground-muted sm:text-base">
              {entry.tagline}
            </p>
          </div>
        </div>

        {/*
          Status pill, hidden on the smallest screens to keep the header from
          wrapping awkwardly. `hidden sm:inline-flex` is the Tailwind way to
          do "show only at sm and up".
        */}
        <span
          className={`hidden shrink-0 items-center rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider ring-1 sm:inline-flex ${status.tone}`}
        >
          {status.label}
        </span>
      </div>

      {/* ---------- Full description paragraph ---------- */}
      {/*
        `leading-relaxed` = `line-height: 1.625`, which reads better for body
        copy than the default. `text-pretty` (Tailwind v4) avoids ugly orphans
        on the last line of the paragraph.
      */}
      <p className="mt-6 text-pretty text-sm leading-relaxed text-foreground-muted sm:text-base">
        {entry.description}
      </p>

      {/* ---------- Stack chips ---------- */}
      <ul className="mt-6 flex flex-wrap gap-2">
        {entry.stack.map((tech) => (
          // `key` is React's way of identifying list items across re-renders.
          // Each chip's tech name is unique within a project, so it's safe.
          <li
            key={tech}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-foreground-muted"
          >
            {tech}
          </li>
        ))}
      </ul>

      {/* ---------- 3-col metrics strip ---------- */}
      {/*
        Each metric is its own bordered tile (vs. the homepage card which uses
        only a top-border). More substantial visual weight, befitting a
        dedicated case-study page.
      */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {entry.metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
              {m.label}
            </div>
            <div className="mt-1.5 text-base font-semibold text-foreground sm:text-lg">
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Footer hint ---------- */}
      {/*
        `mt-auto` pushes this row to the bottom of the flex column, so footers
        line up across cards even when descriptions vary in length.
      */}
      <p className="mt-auto pt-6 font-mono text-[11px] uppercase tracking-wider text-foreground-muted/80">
        {status.footer}
      </p>
    </div>
  );
}

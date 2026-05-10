/**
 * CompetencyCard — one of four "what I deliver" cards on /services.
 *
 * Why a separate component (vs. reusing ServiceCard from /ecosystem)?
 *   On the homepage, ServiceCard sits inside a BentoCard which already
 *   provides the glass shell + hover lift. On the dedicated /services route
 *   we want a *standalone* card with its own shell, plus an extra "Recent
 *   example" line AND an optional "Result" line that anchor the abstract
 *   competency to concrete shipped outcomes. Composing two slightly-different
 *   cards is cleaner than overloading one with conditional flags.
 *
 * Server-renderable:
 *   No `"use client"`. No state, no event handlers, no browser-only APIs.
 *   In the App Router every component is a Server Component by default,
 *   which is the cheapest, fastest option — it renders to HTML on the
 *   server and ships zero JS for this component to the client.
 *   Docs: node_modules/next/dist/docs/01-app/01-getting-started/06-server-and-client-components.md
 *
 * Concept showcase:
 *  - `import type` — the `Service` import is type-only (erased at build time).
 *  - **Optional props** — `example?: string`, plus a derived `outcome` read
 *    from `service.outcome`. The `?` makes a prop optional; if callers omit
 *    it, the corresponding line is hidden. Optional props are how we keep
 *    components flexible without forcing every caller to pass every field.
 *  - **Icon-as-component** — `service.icon` is a React component value
 *    (not a string). We alias it to a capitalized local (`const Icon = ...`)
 *    because JSX treats lowercase tags as raw HTML elements (`<icon>` would
 *    render as a literal `<icon>` HTML tag, not the React component).
 *  - **Tailwind glass utility** — `glass` is a custom `@utility` defined in
 *    `globals.css`; it gives us the frosted background + 1px hairline border
 *    + backdrop blur in one class. See `src/app/globals.css`.
 */

import type { Service } from "@/data/services";

// Props are typed inline. We could also pull this into a separate `type`
// alias, but for a 2-prop component the inline form is more legible.
export function CompetencyCard({
  service,
  example,
}: {
  service: Service;
  // `example?: string` — the trailing `?` marks the prop as optional.
  // Inside the component we check `example` truthiness before rendering it.
  example?: string;
}) {
  // Capitalize the local name so JSX treats it as a component, not an HTML tag.
  const Icon = service.icon;

  return (
    <article
      className={[
        // `glass` = our frosted-glass utility (see globals.css).
        "glass group relative flex h-full flex-col overflow-hidden rounded-2xl p-6",
        // Subtle hover lift mirrors the BentoCard feel from the homepage.
        "transition hover:-translate-y-0.5 hover:bg-white/10",
      ].join(" ")}
    >
      {/* Accent badge for the icon. The violet tint matches the homepage
          ServiceCard so users feel they're in the same visual system. */}
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-violet/15 text-accent-violet ring-1 ring-accent-violet/30">
        <Icon size={18} />
      </div>

      <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
        {service.blurb}
      </p>

      {/*
        Conditional render: only show the divider + "Recent" line if the
        caller provided an `example`. The `&&` short-circuit pattern is the
        idiomatic React way to render-or-skip a fragment based on a value.
      */}
      {example && (
        <>
          {/* Hairline divider — `border-t` + the same translucent white we
              use elsewhere keeps the seam from feeling heavy. */}
          <div className="my-4 border-t border-white/10" />
          <p className="text-xs leading-relaxed text-foreground-muted">
            <span className="font-mono uppercase tracking-[0.18em] text-accent-cyan">
              Recent
            </span>
            <span className="mx-2 text-foreground-muted/60">/</span>
            {example}
          </p>
        </>
      )}

      {/*
        Optional outcome line — surfaces a concrete proof point ("0 incidents
        in 18 months", "287K LOC live"). We use a separate eyebrow color
        (cyan -> emerald-ish) only via the wording: keeping the same accent
        avoids visual noise; the "Result" label provides the semantic shift.

        `service.outcome` is `string | undefined`; the `&&` short-circuit
        renders nothing when it's falsy.
      */}
      {service.outcome && (
        <p className="mt-3 text-xs leading-relaxed text-foreground-muted">
          <span className="font-mono uppercase tracking-[0.18em] text-accent-cyan">
            Result
          </span>
          <span className="mx-2 text-foreground-muted/60">/</span>
          {service.outcome}
        </p>
      )}
    </article>
  );
}

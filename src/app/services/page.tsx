/**
 * /services route — "What I deliver as IT Manager" page.
 *
 * This is the dedicated services page for Shamar Patnett's BGLL IT Manager
 * application. It expands on the homepage's `ServicesGrid` with two extra
 * sections:
 *
 *   1. Four-pillar competencies, each annotated with a *real shipped
 *      example* from M3 Marketplace / BSIF. The competency data is the
 *      same `SERVICES` array used on the homepage — single source of truth.
 *
 *   2. A "Day-one deliverables" list — five concrete things Shamar can ship
 *      in his first weeks at BGLL. The copy here is intentionally
 *      BGLL-specific (Fi We Boledo, Belize Bank, Angular/Groovy ramp). It
 *      mirrors the highlight box in the cover-letter CV so the portfolio
 *      and the paper application tell the same story.
 *
 * Server Component:
 *   No `"use client"` directive. The page renders purely on the server,
 *   which is the App Router default. Children may opt in to client-side
 *   hydration (e.g. `Reveal` uses Framer Motion → marked `"use client"`
 *   inside its own file) — Next.js handles the boundary automatically.
 *
 *   Docs: node_modules/next/dist/docs/01-app/01-getting-started/06-server-and-client-components.md
 *
 * Concept showcase:
 *  - **Route segments** — placing a `page.tsx` under `src/app/services/`
 *    creates the `/services` URL automatically. No router config needed.
 *  - **`metadata` export** — App Router uses static `export const metadata`
 *    instead of `<Head>`; Next merges this with the root layout's
 *    `baseMetadata`, so the page title becomes "Services | …site title…".
 *    Docs: node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
 *  - **`as const` on a tuple-of-objects** — freezes the day-one array's
 *    shape so each entry's `headline` keeps its literal string type. We
 *    don't strictly need it here, but it's the same pattern used in
 *    `services.ts`, so reusing it keeps the codebase consistent.
 *  - **Co-locating data with the page** — small one-page-only datasets
 *    live next to their consumer. We only promote data into `src/data/`
 *    when it's reused across multiple components.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animations/Reveal";
import { CompetencyCard } from "@/components/projects/CompetencyCard";
import { DayOneRow } from "@/components/projects/DayOneRow";
import { SERVICES } from "@/data/services";

// `Metadata` is the type from Next for the `metadata` export. Using the
// type (rather than letting it be inferred) gives us autocomplete on every
// available SEO field. The root layout's `baseMetadata` provides the title
// template, so this becomes e.g. "Services | Shamar T. Patnett".
export const metadata: Metadata = {
  title: "Services",
  description:
    "Four pillars of IT leadership delivery — operations, infrastructure, full-stack engineering, and payments + security — plus the concrete deliverables I can ship at BGLL on day one.",
};

/**
 * "Recent example" copy for each competency. Index-aligned with the
 * `SERVICES` array (so SERVICES[0] pairs with COMPETENCY_EXAMPLES[0]).
 *
 * `as const` makes this a `readonly [string, string, string, string]`
 * tuple; TS will catch us if the length drifts out of sync with SERVICES.
 *
 * Why not put these on the `Service` interface itself? Because the
 * homepage `ServicesGrid` deliberately does *not* show the example line —
 * it's a /services-only embellishment. Keeping `Service` minimal in
 * `data/services.ts` avoids leaking page-specific copy into shared data.
 */
const COMPETENCY_EXAMPLES = [
  // 0 — IT Strategy & Operations
  "Sole IT authority at BSIF for 1.5+ years — procurement, vendor SLAs, infrastructure, and cybersecurity policy executed daily without the formal title.",
  // 1 — Network & Infrastructure
  "Production deploy on Google Cloud Run + Cloud SQL + VPC for M3 Marketplace, with on-prem AD and redundant ISP integration at BSIF.",
  // 2 — Full-Stack Development
  "287K LOC shipped on M3 Marketplace — Flutter client, Serverpod backend, PostgreSQL 16 with pgvector and PostGIS, real-time WebSocket inventory.",
  // 3 — Payments & Security
  "Belize Bank integration shipped in production on M3 Marketplace: hosted payment page, HMAC-signed webhooks, tokenized cards, transaction reconciliation.",
] as const;

/**
 * Day-one deliverables for BGLL. Copy is verbatim from the cover-letter
 * highlight box and the CV — keeping these synchronised matters because
 * recruiters cross-reference the portfolio against the printed CV.
 *
 * Each row is `{ headline, detail }`. The `<DayOneRow>` component supplies
 * the numeric badge (`01`, `02`, …) from the array index.
 */
const DAY_ONE_DELIVERABLES = [
  {
    headline: "Belize Bank cards in the Fi We Boledo app",
    detail:
      "Production integration is already shipped on M3 Marketplace — hosted payment page, HMAC-signed webhooks, tokenized cards, reconciliation. Adapting the same pattern into Fi We Boledo is a 6–8 week effort, not a research project.",
  },
  {
    headline: "Auth security uplift across the BGLL stack",
    detail:
      "Multi-factor authentication, biometric login (fingerprint / face ID), and PII masking for the bank-account fields currently shown in plain text on the Payment Information screen.",
  },
  {
    headline: "Operational ownership from week one",
    detail:
      "Full IT-Manager-equivalent duties — procurement, vendor management, infrastructure, cybersecurity policy, and L1/L2 support — are what I run daily at BSIF today. The role is already in muscle memory.",
  },
  {
    headline: "UX audit & iteration on the Boledo customer flows",
    detail:
      "Targeted improvements to the ticket purchase flow, winning numbers display, and empty-state screens — informed by shipping a 12-module customer-facing mobile app on M3 Marketplace.",
  },
  {
    headline: "Transitional ramp on Angular & Groovy",
    detail:
      "A focused 4–6 week onboarding plan to reach productive contribution velocity in BGLL's existing Angular/Groovy stack, while delivering on the IT operations and payment/security work above in parallel.",
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      {/* ── Section 1: page header + four competency pillars ───────────── */}
      <Section
        eyebrow="Services"
        title="What I deliver as IT Manager."
        description="Four pillars of scope — IT operations, network and infrastructure, full-stack engineering, and payments + security — each backed by production work shipped at BSIF and on the M3 Marketplace platform."
      >
        {/*
          Two-column grid from `md:` breakpoint upward. On mobile we collapse
          to a single column so each card gets the full width — easier to
          read on a phone than two cramped halves.
        */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SERVICES.map((service, i) => (
            // `Reveal` is a client component (Framer Motion). Wrapping each
            // card in one gives us a staggered fade-in as the user scrolls;
            // `delay={i * 0.08}` cascades the entries.
            <Reveal key={service.title} delay={i * 0.08} className="h-full">
              <CompetencyCard
                service={service}
                example={COMPETENCY_EXAMPLES[i]}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Section 2: Day-one deliverables ─────────────────────────────── */}
      <Section
        id="day-one"
        eyebrow="Day-one deliverables"
        title="What I can ship at BGLL in the first weeks."
        description="Five concrete outcomes — not aspirations. Each one maps to work I have already executed at BSIF or shipped in production on M3 Marketplace."
      >
        <div className="flex flex-col gap-3">
          {DAY_ONE_DELIVERABLES.map((row, i) => (
            <Reveal key={row.headline} delay={i * 0.06}>
              {/* Index is 0-based in the array; add 1 so we display "01" */}
              <DayOneRow
                index={i + 1}
                headline={row.headline}
                detail={row.detail}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Section 3: Closing CTA ──────────────────────────────────────── */}
      <Section className="pb-28">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent-cyan">
                  Next step
                </span>
                <h3 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  Let&apos;s talk.
                </h3>
                <p className="mt-3 text-foreground-muted">
                  If any of this lines up with what BGLL needs, I&apos;d
                  welcome an interview. Direct line below — happy to walk
                  through the Belize Bank integration, MFA design, or the
                  Angular/Groovy ramp plan in detail.
                </p>
              </div>
              {/*
                `next/link` is the App Router's client-side navigation
                primitive: it prefetches the destination route and avoids
                a full page reload. Using a plain <a href="/contact"> would
                also work but would re-fetch all shared chunks.
              */}
              <Link
                href="/contact"
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium",
                  "bg-foreground text-background transition hover:opacity-90",
                  // `motion-safe:` so the icon nudge respects user prefs.
                  "motion-safe:hover:[&_svg]:translate-x-0.5",
                ].join(" ")}
              >
                Contact Shamar
                {/* `transition` on the icon itself so the parent's
                    `hover:[&_svg]:translate-x-0.5` animates smoothly. */}
                <ArrowRight size={16} className="transition" />
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

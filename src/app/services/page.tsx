/**
 * /services route — "What I deliver" page.
 *
 * Top-level layout (top → bottom):
 *
 *   1. Hero header (page title + subtitle)
 *   2. Tech-stack alignment strip (chip row of 14 technologies)
 *   3. Dual-track toggle  ← lives inside <TrackedSections>
 *   4. Four-pillar competencies, filtered by track
 *   5. Day-one deliverables, filtered by track + with metric chips
 *   6. 30 / 60 / 90 onboarding plan
 *   7. Two-CTA closing card (book call + download summary PDF)
 *
 * Server Component:
 *   No `"use client"` directive on this file. The page renders purely on the
 *   server, which is the App Router default. The interactive bits (tab
 *   strip, scroll-reveal animations) are scoped to their own client
 *   children — `<TrackedSections>` wraps both filterable sections so the
 *   `useState` for the toggle lives in ONE place. Keeping the page itself
 *   server-side preserves our `metadata` export (Next refuses to build a
 *   client component that exports `metadata`).
 *
 *   Docs:
 *   - node_modules/next/dist/docs/01-app/01-getting-started/06-server-and-client-components.md
 *   - node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
 *
 * Concept showcase:
 *  - **Route segments** — placing a `page.tsx` under `src/app/services/`
 *    creates the `/services` URL automatically.
 *  - **`metadata` export** — App Router uses static `export const metadata`
 *    instead of `<Head>`; Next merges with the root layout's `baseMetadata`.
 *  - **`as const` on a tuple-of-objects** — freezes the day-one tuple's
 *    shape so each entry's `headline` keeps its literal string type. We
 *    rely on this when typing the prop into `<TrackedSections>`.
 *  - **Co-locating data with the page** — the day-one tuple and the
 *    competency-example list are page-local editorial copy; we keep them
 *    here rather than promoting to `src/data/` because they're not reused.
 *  - **Server-to-client prop passing** — function values (icon components)
 *    survive the boundary because they come from the same module graph;
 *    plain string/array data also crosses fine. Anything serializable.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Download } from "lucide-react";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animations/Reveal";
import { OnboardingPlan } from "@/components/projects/OnboardingPlan";
import { TechStackStrip } from "@/components/projects/TechStackStrip";
import {
  TrackedSections,
  type DayOneRowEntry,
} from "@/components/projects/TrackedSections";

// `Metadata` is the type from Next for the `metadata` export. Using the type
// (rather than letting it be inferred) gives us autocomplete on every
// available SEO field. The root layout's `baseMetadata` provides the title
// template, so this becomes e.g. "Services | Shamar T. Patnett".
export const metadata: Metadata = {
  title: "Services",
  description:
    "Four pillars covering both IT-Manager and software-engineering roles — operations, infrastructure, full-stack delivery, and payments + security — plus the concrete deliverables I can ship on day one.",
};

/**
 * "Recent example" copy for each competency. Index-aligned with the
 * `SERVICES` array (so SERVICES[0] pairs with COMPETENCY_EXAMPLES[0]).
 *
 * `as const` makes this a `readonly [string, string, string, string]`
 * tuple; TS will catch us if the length drifts out of sync with SERVICES.
 *
 * Why not put these on the `Service` interface itself? Because the homepage
 * `ServicesGrid` deliberately does *not* show the example line — it's a
 * /services-only embellishment. Keeping `Service` minimal in
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
  "Three live payment providers shipped on M3 Marketplace: Stripe, PayPal, and the Belize Bank gateway (any debit/credit card from any issuer) — hosted payment page, HMAC-signed webhooks, tokenized cards, transaction reconciliation.",
] as const;

/**
 * Day-one deliverables. Copy is intentionally GENERIC (category-language,
 * not company-specific) so the same page reads sensibly to any prospective
 * employer — IT-Manager hire OR Software-Engineer hire.
 *
 * Each row is `DayOneRowEntry` (see `TrackedSections`). The shape is:
 *   { headline, detail, track[], metric?, iconKey? }
 *
 * `iconKey` is a STRING that the client-side TrackedSections re-resolves into
 * a Lucide component. Why a string and not the component itself? Because
 * function values can't cross the React Server Component → Client Component
 * boundary. We use the same `string-key + Record<key, LucideIcon>` pattern
 * that `StickyCaseStudy` uses elsewhere in the codebase.
 *
 * `track` drives the dual-track toggle filter. Most rows belong to BOTH
 * lanes; legacy-stack ramp is SWE-only, ops ownership is IT-only, etc.
 */
const DAY_ONE_DELIVERABLES: readonly DayOneRowEntry[] = [
  {
    headline: "Local card payments via the bank gateway",
    // Generalised: was BGLL/Fi-We-Boledo specific. Kept the concrete
    // deliverable (gateway integration, hosted payment page, webhooks,
    // reconciliation) and the timeline; dropped the company name lock.
    detail:
      "I have already shipped Belize Bank gateway integration on M3 Marketplace — hosted payment page, HMAC-signed webhooks, tokenized cards, reconciliation. Adapting the same pattern into any local card-payment surface that today only supports digital wallets is a focused 6–8 week effort, not a research project.",
    metric: "6–8 weeks",
    iconKey: "credit-card",
    track: ["it", "swe"],
  },
  {
    headline: "Auth security uplift across the stack",
    detail:
      "Multi-factor authentication, biometric login (fingerprint / face ID), and PII masking for any bank-account fields currently rendered in plain text. Pattern is already proven in production on M3.",
    metric: "MFA · biometric · PCI",
    iconKey: "shield-check",
    track: ["it", "swe"],
  },
  {
    headline: "Operational ownership from week one",
    // Generalised: dropped "BGLL" framing, kept the BSIF proof point.
    detail:
      "Procurement, vendor management, infrastructure, cybersecurity policy, and L1/L2 support are what I run daily at BSIF today. The role is already in muscle memory — no ramp on the operations side.",
    metric: "Daily at BSIF",
    iconKey: "settings",
    track: ["it"],
  },
  {
    headline: "UX audit & iteration on customer flows",
    detail:
      "Targeted improvements to purchase, results, and empty-state screens — informed by shipping a 12-module customer-facing mobile app on M3 Marketplace.",
    metric: "12-module mobile app",
    iconKey: "eye",
    track: ["swe"],
  },
  {
    headline: "Transitional ramp on the team's existing stack",
    // Generalised: was "Angular & Groovy" hard-coded; now reads as a
    // category-language onboarding plan that happens to apply to whatever
    // legacy stack the team uses.
    detail:
      "A focused 4–6 week onboarding plan to reach productive velocity on the team's existing web stack, while delivering on IT-operations and payment / security work in parallel.",
    metric: "4–6 weeks",
    iconKey: "git-branch",
    track: ["swe"],
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      {/* ── Section 0: Page header ─────────────────────────────────────── */}
      <Section
        eyebrow="Services"
        title="What I deliver as IT Manager or Software Engineer."
        description="Four pillars of scope spanning both tracks — IT operations, network and infrastructure, full-stack engineering, and payments + security — each backed by production work shipped at BSIF and on the M3 Marketplace platform."
        className="!pb-4"
      >
        {/* Tech-stack chip row — recruiter-friendly keyword surface. */}
        <Reveal>
          <TechStackStrip />
        </Reveal>
      </Section>

      {/*
        TrackedSections is a CLIENT component (it owns the `useState` for the
        track toggle). It renders:
          - the toggle pill
          - the filtered competencies grid
          - the filtered day-one rows

        We pass the index-aligned competency examples and the day-one tuple
        as props. Both are plain string / object data → crosses the
        server→client boundary safely. The icon components attached to each
        row also cross fine because they come from the shared module graph
        (Lucide), not from the server's runtime state.
      */}
      <TrackedSections
        competencyExamples={COMPETENCY_EXAMPLES}
        dayOneRows={DAY_ONE_DELIVERABLES}
      />

      {/* ── Section 6: 30/60/90 onboarding plan ────────────────────────── */}
      <Section
        eyebrow="30 / 60 / 90"
        title="A structured first quarter."
        description="The standard interview question, answered on the page. Listen first, ship quick wins, then publish a roadmap."
      >
        <OnboardingPlan />
      </Section>

      {/* ── Section 7: Two-CTA closing card ────────────────────────────── */}
      <Section className="pb-28">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
            <div className="flex flex-col items-start gap-6">
              <div className="max-w-2xl">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent-cyan">
                  Next step
                </span>
                <h3 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  Two ways to start a conversation.
                </h3>
                <p className="mt-3 text-foreground-muted">
                  Pick the one that fits your timeline. Happy to walk through
                  the Belize Bank integration, MFA design, or the legacy-stack
                  ramp plan in detail.
                </p>
              </div>

              {/*
                Two-button CTA group. On mobile the buttons stack; from `sm:`
                they sit side-by-side. The second button is `<a download>`
                rather than `<Link>` so the browser triggers a file download
                instead of a route navigation — the PDF lives in /public.
              */}
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
                {/*
                  Primary CTA — `next/link` for client-side nav. Solid
                  foreground/background pair pulls the eye to this option as
                  the recommended first step.
                */}
                <Link
                  href="/contact"
                  className={[
                    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium",
                    "bg-foreground text-background transition hover:opacity-90",
                    "motion-safe:hover:[&_svg.arrow]:translate-x-0.5",
                  ].join(" ")}
                >
                  <CalendarClock size={16} aria-hidden />
                  Book a 15-min call
                  <ArrowRight size={16} className="arrow transition" />
                </Link>

                {/*
                  Secondary CTA — plain `<a>` with `download` so the browser
                  saves the file rather than navigating. The actual PDF will
                  be dropped into /public/about/ by the owner; until then the
                  link 404s gracefully (which is fine in a portfolio context
                  — the live page just shows a "not found" if clicked early).
                */}
                <a
                  href="/about/services-summary.pdf"
                  download
                  className={[
                    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium",
                    "border border-white/10 bg-white/5 text-foreground transition",
                    "hover:border-white/20 hover:bg-white/10",
                  ].join(" ")}
                >
                  <Download size={16} aria-hidden />
                  Download engagement summary (PDF)
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

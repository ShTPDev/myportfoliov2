/**
 * services.ts — professional competencies shown on the homepage / services page.
 *
 * Reframed from "services I sell" to "what I bring to an IT Manager OR Software
 * Engineer role" — four pillars covering ops, infra, engineering, and
 * security/payments.
 *
 * Concept showcase:
 *  - **`import type`** — the `LucideIcon` import is type-only, so the bundler
 *    can erase it entirely. Zero runtime cost for type-only imports.
 *  - **Icon-as-component pattern** — we store the React component itself on
 *    each entry (not a string name), so the UI renders `<service.icon />`
 *    with no lookup table.
 *  - **`as const`** + `readonly Service[]` — array is immutable and each
 *    title/blurb keeps its literal string type for autocomplete.
 *  - **Literal-string union via `as const`-narrowed tuple** — `track` is
 *    typed as `readonly ("it" | "swe")[]`. The union pins valid track ids at
 *    compile time, and `readonly` blocks accidental mutation.
 *  - **Optional fields** (`outcome?`) — `?` means a field can be missing.
 *    Consumers MUST handle `undefined` (we already do that pattern in
 *    `CompetencyCard`).
 */

import type { LucideIcon } from "lucide-react";
import { Code2, Network, Settings2, ShieldCheck } from "lucide-react";

/**
 * `Track` — which "hat" a competency / day-one row applies to.
 *
 * Why a union of two literal strings rather than an enum? Plain string-literal
 * unions are the idiomatic TS way to encode a small closed set. They tree-shake
 * to zero bytes (no enum runtime object), and the strings show up directly in
 * JSX/data without a lookup. `enum` only earns its keep when you need numeric
 * codes or reverse mapping — neither applies here.
 */
export type Track = "it" | "swe";

// Shape of one competency entry. Exporting the interface lets UI components
// type their props as `Service` rather than re-declaring the same fields.
export interface Service {
  title: string;
  blurb: string;
  // `LucideIcon` is the type of a Lucide React icon component. Storing the
  // component (not a string id) means the UI just renders `<service.icon />`.
  icon: LucideIcon;
  /**
   * Which dual-track lane(s) this competency belongs to. Used by the
   * "As IT Manager / As Software Engineer / Both" toggle on /services to
   * filter cards.
   *
   * `readonly Track[]` — array reference is immutable; we can't push/pop.
   * Lets a competency appear under one OR both tracks (e.g. "Payments &
   * Security" applies to both an IT Manager and a Software Engineer).
   */
  track: readonly Track[];
  /**
   * One-line concrete outcome / proof point. Rendered as the third line on
   * `CompetencyCard` ("Result: …"). Optional because the homepage version of
   * the card (`ServiceCard` in `/ecosystem`) does not show it; only the
   * /services route does.
   */
  outcome?: string;
}

export const SERVICES: readonly Service[] = [
  {
    title: "IT Strategy & Operations",
    blurb:
      "Full-spectrum IT management: procurement, vendor SLAs, infrastructure planning, cybersecurity policy, and asset lifecycle from purchase to decommission.",
    icon: Settings2,
    // IT-only — vendor management / procurement is squarely an IT-Manager
    // responsibility, not a typical SWE scope.
    track: ["it"],
    outcome: "0 production incidents in 18 months at BSIF",
  },
  {
    title: "Network & Infrastructure",
    blurb:
      "Structured cabling to Cloud Run: Active Directory, redundant ISP integration, on-prem hardening, Docker, and Google Cloud (Run, Cloud SQL, VPC).",
    icon: Network,
    // Infra straddles both lanes — IT runs the network, SWE builds the cloud
    // services that ride on it.
    track: ["it", "swe"],
    outcome: "Auto-scaling 0–15 instances; 99.97% uptime (90d)",
  },
  {
    title: "Full-Stack Development",
    blurb:
      "Production Flutter + Serverpod + PostgreSQL systems — 287K LOC shipped on the live M3M3 Marketplace across mobile, web, and desktop.",
    icon: Code2,
    // SWE-only — engineering output rather than IT operations.
    track: ["swe"],
    outcome: "287K LOC live; 87 endpoints; 159 migrations",
  },
  {
    title: "Payments & Security",
    blurb:
      "Live integrations with Stripe, PayPal, and the Belize Bank payment gateway (accepts any debit or credit card from any issuer) — plus real-time fraud detection, MFA + biometric auth, and PCI-DSS tokenization end-to-end.",
    icon: ShieldCheck,
    // Both — IT owns auth/PCI policy, SWE ships the integration code.
    track: ["it", "swe"],
    outcome: "543 tests · 78% coverage · QA Grade A on payments module",
  },
] as const;

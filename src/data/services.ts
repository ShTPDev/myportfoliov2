/**
 * services.ts — professional competencies shown on the homepage / services page.
 *
 * Reframed from "services I sell" to "what I bring to an IT Manager role" —
 * four pillars covering ops, infra, engineering, and security/payments.
 *
 * Concept showcase:
 *  - **`import type`** — the `LucideIcon` import is type-only, so the bundler
 *    can erase it entirely. Zero runtime cost for type-only imports.
 *  - **Icon-as-component pattern** — we store the React component itself on
 *    each entry (not a string name), so the UI renders `<service.icon />`
 *    with no lookup table.
 *  - **`as const`** + `readonly Service[]` — array is immutable and each
 *    title/blurb keeps its literal string type for autocomplete.
 */

import type { LucideIcon } from "lucide-react";
import { Code2, Network, Settings2, ShieldCheck } from "lucide-react";

// Shape of one competency entry. Exporting the interface lets UI components
// type their props as `Service` rather than re-declaring the same fields.
export interface Service {
  title: string;
  blurb: string;
  // `LucideIcon` is the type of a Lucide React icon component. Storing the
  // component (not a string id) means the UI just renders `<service.icon />`.
  icon: LucideIcon;
}

export const SERVICES: readonly Service[] = [
  {
    title: "IT Strategy & Operations",
    blurb:
      "Full-spectrum IT management: procurement, vendor SLAs, infrastructure planning, cybersecurity policy, and asset lifecycle from purchase to decommission.",
    icon: Settings2,
  },
  {
    title: "Network & Infrastructure",
    blurb:
      "Structured cabling to Cloud Run: Active Directory, redundant ISP integration, on-prem hardening, Docker, and Google Cloud (Run, Cloud SQL, VPC).",
    icon: Network,
  },
  {
    title: "Full-Stack Development",
    blurb:
      "Production Flutter + Serverpod + PostgreSQL systems — 287K LOC shipped on the live M3M3 Marketplace across mobile, web, and desktop.",
    icon: Code2,
  },
  {
    title: "Payments & Security",
    blurb:
      "Four-provider payment integration (incl. Belize Bank), real-time fraud detection, MFA + biometric auth, and PCI-DSS tokenization end-to-end.",
    icon: ShieldCheck,
  },
] as const;

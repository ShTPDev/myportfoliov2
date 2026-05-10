/**
 * services.ts — offerings shown on the homepage / services page.
 */

import type { LucideIcon } from "lucide-react";
import { Code2, CreditCard, Server, Smartphone } from "lucide-react";

// `LucideIcon` is the type of a Lucide React icon component. Storing it on
// each service lets the UI render `<service.icon />` directly.
export interface Service {
  title: string;
  blurb: string;
  icon: LucideIcon;
}

export const SERVICES: readonly Service[] = [
  {
    title: "Marketplace platforms",
    blurb:
      "Multi-vendor commerce with order, inventory, and fulfillment flows.",
    icon: Code2,
  },
  {
    title: "Payment integrations",
    blurb:
      "Local + international gateways, reconciliation, refund flows, audit logs.",
    icon: CreditCard,
  },
  {
    title: "Mobile apps",
    blurb: "Customer + driver apps with offline support and push notifications.",
    icon: Smartphone,
  },
  {
    title: "Self-hosted infra",
    blurb: "Linux servers, Docker, private networking — own your stack.",
    icon: Server,
  },
] as const;

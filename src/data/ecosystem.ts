/**
 * ecosystem.ts — data for the M3 product showcase.
 *
 * Concept showcase:
 *  - **Discriminated unions via `kind`** — each ecosystem entry has a `kind`
 *    literal so UI code can branch on it with full type narrowing.
 *  - **Nested `readonly` arrays** — `metrics: readonly Metric[]` makes the
 *    array immutable, preventing accidental mutation.
 *  - **Importing icon components as data** — same pattern as services.ts.
 */

import type { LucideIcon } from "lucide-react";
import {
  ShoppingBag,
  Truck,
  LayoutDashboard,
  CreditCard,
} from "lucide-react";

// `Kind` is a literal-union acting as a tag. It lets a future component
// switch on `entry.kind` and TS will narrow the type inside each branch.
export type EcosystemKind = "marketplace" | "runner" | "admin" | "payments";

export interface Metric {
  label: string;
  value: string;
}

export interface EcosystemEntry {
  kind: EcosystemKind;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  // Tailwind classes — the accent color theme for the card.
  accentClass: string;
  // Tech stack chips.
  stack: readonly string[];
  // Quick stats shown on the card.
  metrics: readonly Metric[];
}

export const ECOSYSTEM: readonly EcosystemEntry[] = [
  {
    kind: "marketplace",
    title: "M3 Marketplace",
    tagline: "Customer-facing commerce app for Belize.",
    description:
      "Multi-vendor mobile + web storefront. Catalog browsing, cart, checkout, order tracking. Built for low-bandwidth networks with offline-first sync.",
    icon: ShoppingBag,
    accentClass: "text-accent-cyan ring-accent-cyan/30 bg-accent-cyan/15",
    stack: ["Flutter", "Serverpod", "Postgres"],
    metrics: [
      { label: "platforms", value: "iOS · Android · Web" },
      { label: "vendors", value: "multi-tenant" },
      { label: "offline", value: "first-class" },
    ],
  },
  {
    kind: "runner",
    title: "M3 Runner",
    tagline: "Driver app + dispatch backbone.",
    description:
      "Live order assignment, route optimization, proof-of-delivery photos, COD reconciliation. Push-driven with reliable retry queues.",
    icon: Truck,
    accentClass: "text-accent-violet ring-accent-violet/30 bg-accent-violet/15",
    stack: ["Flutter", "WebSockets", "WireGuard"],
    metrics: [
      { label: "dispatch", value: "real-time" },
      { label: "delivery proof", value: "photo + sig" },
      { label: "settlement", value: "automated" },
    ],
  },
  {
    kind: "admin",
    title: "Admin Dashboard",
    tagline: "Operations cockpit for vendors.",
    description:
      "Inventory, orders, finance, analytics. Built as a Flutter web app sharing models with the mobile clients — one schema, three surfaces.",
    icon: LayoutDashboard,
    accentClass: "text-accent-blue ring-accent-blue/30 bg-accent-blue/15",
    stack: ["Flutter Web", "Drift", "Charts"],
    metrics: [
      { label: "shared models", value: "Dart-first" },
      { label: "reports", value: "live + scheduled" },
      { label: "auth", value: "RBAC" },
    ],
  },
  {
    kind: "payments",
    title: "Payment Gateway",
    tagline: "Local Belize rails + reconciliation.",
    description:
      "Integration with local processors, idempotent capture/refund flows, double-entry ledger, audit trail. Designed to survive network flakes.",
    icon: CreditCard,
    accentClass: "text-accent-cyan ring-accent-cyan/30 bg-accent-cyan/15",
    stack: ["Serverpod", "Postgres", "Stripe-style"],
    metrics: [
      { label: "ledger", value: "double-entry" },
      { label: "retries", value: "idempotent" },
      { label: "audit", value: "append-only" },
    ],
  },
] as const;

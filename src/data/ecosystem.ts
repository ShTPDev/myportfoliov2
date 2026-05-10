/**
 * ecosystem.ts — data for the production-projects showcase.
 *
 * Source of truth: Shamar T. Patnett's CV (real, shipped or in-production
 * projects). This file lists the four flagship projects shown on the
 * portfolio's ecosystem section.
 *
 * Concept showcase:
 *  - **Discriminated unions via `kind`** — each entry has a `kind` literal
 *    so UI code can branch on it with full TS type narrowing
 *    (e.g. `if (entry.kind === "betting") { ... }`).
 *  - **Literal-union extensibility** — adding a new `kind` is a one-line
 *    edit; TS will then catch any `switch` that forgot to handle it.
 *  - **Nested `readonly` arrays** — `metrics: readonly Metric[]` makes the
 *    array immutable, preventing accidental mutation downstream.
 *  - **Importing icon components as data** — lucide-react icons are React
 *    components, so we can store them in plain data and let the consumer
 *    render them. Same pattern as services.ts.
 *  - **`as const` on the array literal** — locks every nested string to its
 *    literal type, so tooling (and TS) can narrow on it later.
 */

import type { LucideIcon } from "lucide-react";
import {
  ShoppingBag,
  Trophy,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";

// `EcosystemKind` is a literal-union acting as a tag. It lets a future
// component switch on `entry.kind` and TS will narrow the type inside each
// branch (a "discriminated union" pattern).
//
// Two new kinds added vs. the old placeholder set:
//   - "betting"  : sports betting platform (BeliBet)
//   - "internal" : internal/enterprise IT system (BSIF SIF IT System)
export type EcosystemKind =
  | "marketplace"
  | "betting"
  | "payments"
  | "internal";

export interface Metric {
  label: string;
  value: string;
}

export interface EcosystemEntry {
  kind: EcosystemKind;
  title: string;
  tagline: string;
  description: string;
  // `LucideIcon` is the type for any lucide-react icon component.
  icon: LucideIcon;
  // Tailwind utility classes — the accent color theme for the card.
  accentClass: string;
  // Tech stack chips. `readonly string[]` means callers can read but not push.
  stack: readonly string[];
  // Quick stats shown on the card.
  metrics: readonly Metric[];
}

// `as const` here freezes the array AND every string inside it to its literal
// type. Combined with `readonly EcosystemEntry[]`, this is fully immutable.
export const ECOSYSTEM: readonly EcosystemEntry[] = [
  {
    // M3 Marketplace — the flagship. Real production system on GCP.
    kind: "marketplace",
    title: "M3 Marketplace",
    tagline: "Live enterprise e-commerce on Google Cloud.",
    description:
      "287,026 LOC. Dart/Flutter (mobile + web + desktop), Serverpod backend, PostgreSQL 16 + pgvector + PostGIS, Redis, PgBouncer, Docker. Sole architect: 18-module admin panel + 12-module customer app. Live multi-provider payments: Stripe, PayPal, and the Belize Bank gateway (any card, any issuer).",
    icon: ShoppingBag,
    accentClass: "text-accent-cyan ring-accent-cyan/30 bg-accent-cyan/15",
    stack: ["Flutter", "Serverpod", "Postgres 16", "Redis", "GCP"],
    metrics: [
      { label: "LOC", value: "287K" },
      { label: "REST APIs", value: "87" },
      { label: "Status", value: "Production" },
    ],
  },
  {
    // BeliBet — directly relevant to BGLL (gambling/betting industry).
    kind: "betting",
    title: "BeliBet",
    tagline: "Sports betting platform — direct gambling-industry experience.",
    description:
      "Full-stack Serverpod + Flutter mobile + admin web. WebSocket real-time event streaming, user wallet auto-created on signup, SHA256-hashed auth, admin event/betting management. Same operational and regulatory environment as BGLL.",
    icon: Trophy,
    accentClass: "text-accent-violet ring-accent-violet/30 bg-accent-violet/15",
    stack: ["Serverpod", "Flutter", "WebSockets", "SHA256"],
    metrics: [
      { label: "Streaming", value: "Real-time" },
      { label: "Wallet", value: "Auto-created" },
      { label: "Industry", value: "Gambling" },
    ],
  },
  {
    // TraySoft Payment Module — production-ready 4-provider package.
    kind: "payments",
    title: "TraySoft Payment Module",
    tagline: "Production payment package — 4 providers, fraud-detection.",
    description:
      "Standalone Serverpod/Flutter package. Stripe + PayPal + Belize Bank gateway (accepts any card from any issuer) + COD. Fraud engine (9-factor risk score), velocity tracking, blocklist, marketplace splits, multi-currency. 543 automated tests at 78% coverage (QA Grade A).",
    icon: CreditCard,
    accentClass: "text-accent-cyan ring-accent-cyan/30 bg-accent-cyan/15",
    stack: ["Stripe", "PayPal", "Belize Bank", "COD"],
    metrics: [
      { label: "Tests", value: "543" },
      { label: "Coverage", value: "78%" },
      { label: "Grade", value: "A" },
    ],
  },
  {
    // SIF IT System — internal production system at BSIF (current job).
    kind: "internal",
    title: "SIF IT System (BSIF)",
    tagline: "Internal production system at Belize Social Investment Fund.",
    description:
      "Multi-platform Serverpod/Flutter system: barcode-based ID generation, PDF report printing, FL Charts analytics, DataTable2 large data sets, Serverpod Streams for real-time updates. Built and maintained as part of sole IT-administrator role.",
    icon: LayoutDashboard,
    accentClass: "text-accent-blue ring-accent-blue/30 bg-accent-blue/15",
    stack: ["Serverpod", "Flutter", "Charts", "PDF"],
    metrics: [
      { label: "Status", value: "Production" },
      { label: "Use", value: "Internal" },
      { label: "Owner", value: "BSIF" },
    ],
  },
] as const;

/**
 * ecosystem.ts — data for the production-projects showcase.
 *
 * Source of truth: real projects in `D:\Projects` and
 * `C:\Users\shama\Documents\PJ-PINK\pink`. Updated to reflect actual scope,
 * status, surfaces, and feature lists rather than placeholder copy.
 *
 * Concept showcase:
 *  - **Discriminated unions via `kind`** — each entry has a `kind` literal
 *    so UI code can branch on it with full TS type narrowing.
 *  - **`status` literal-union** — drives a status badge color on the card.
 *  - **`surfaces` array** — typed list of platforms (web, mobile, server,
 *    desktop, static-site) so cards can show "📱 iOS · 🖥 Web · ⚙ Server".
 *  - **`gallery` array of typed `Screenshot` objects** — the StickyCaseStudy
 *    component uses this to render a placeholder grid OR real screenshots
 *    once Shamar drops images into `public/projects/<slug>/`. Empty array
 *    just hides the gallery — zero-config opt-in.
 */

import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  ShoppingBag,
  Trophy,
  Truck,
} from "lucide-react";

// ── Type primitives ────────────────────────────────────────────────────────

// `kind` discriminator. Adding a new kind is a one-line edit; TS will then
// catch any `switch` that forgot to handle it.
export type EcosystemKind =
  | "marketplace"
  | "payments"
  | "betting"
  | "internal"
  | "real-estate"
  | "marketing-site"
  | "desktop"
  | "logistics";

// What kind of surface(s) the project exposes. Drives the icon-strip on
// the card. Pure literal-union so a typo is a compile error.
export type Surface =
  | "ios"
  | "android"
  | "web"
  | "admin-web"
  | "desktop"
  | "server"
  | "static-site"
  | "package";

// Production status — colors map in the UI.
//   live           → real users on it right now
//   internal-prod  → in production for an internal/government audience
//   wip            → actively being built, partially shipped
//   prototype      → early, experimental
//   archived       → not maintained
export type ProjectStatus =
  | "live"
  | "internal-prod"
  | "wip"
  | "prototype"
  | "archived";

export interface Metric {
  label: string;
  value: string;
}

/**
 * One gallery slot — either a static screenshot OR a short looping video clip.
 *
 * Author drops the file into `public/projects/<slug>/<filename>` and lists
 * it here. The StickyCaseStudy component branches on `kind` to render the
 * right element.
 *
 * Why a discriminated union (`kind: "image" | "video"`)?
 *   - Type-safe: each variant declares only the fields it actually needs
 *     (no `poster` on images, no `alt` required on videos).
 *   - Future-proof: adding a `kind: "youtube"` later is a one-line edit.
 *   - The renderer uses `if (item.kind === "video")` to narrow the union;
 *     TS knows the rest of the fields per branch.
 *
 * Empty `gallery` array → nothing renders. No broken-image icons.
 *
 * Backward-compat: `Screenshot` kept as an alias of `ImageGalleryItem` so
 * older code paths that imported `Screenshot` keep working.
 */
export interface ImageGalleryItem {
  kind: "image";
  src: string; // absolute URL relative to /public, e.g. "/projects/m3-marketplace/dashboard.png"
  alt: string;
  caption?: string;
}

export interface VideoGalleryItem {
  kind: "video";
  src: string; // absolute URL relative to /public, e.g. "/projects/m3-runner/driver.mp4"
  caption?: string;
  /** Optional still image shown before the video plays. */
  poster?: string;
}

export type GalleryItem = ImageGalleryItem | VideoGalleryItem;

// Legacy alias — older imports of `Screenshot` resolve to the image variant.
export type Screenshot = ImageGalleryItem;

/**
 * One outbound link (live URL, repo, app store, demo video, downloadable
 * report, etc.). Rendered as a chip-row beneath the project tagline.
 *
 * `kind` drives the icon. Add new kinds to the literal union when needed.
 */
export interface ProjectLink {
  label: string;
  href: string;
  kind: "live" | "repo" | "demo" | "app-store" | "doc" | "external";
}

/**
 * Optional grouping for the stack chips. If present, the StickyCaseStudy
 * component renders one labelled row per group (Frontend / Backend / Data
 * / Infra / Integrations) instead of a single flat list of chips.
 *
 * `Record<K, V>` here is "an object whose keys are arbitrary strings and
 * whose values are readonly string arrays". We keep it open-ended (string
 * keys, not a literal union) so future projects can introduce new group
 * names ("Mobile", "Desktop", "Tooling") without editing this type.
 *
 * The shape is intentionally a `Record` rather than an array of
 * `{ name, items }` so the data file reads more like a table — the group
 * name is the key, the chips are the value.
 */
export type StackGroups = Readonly<Record<string, readonly string[]>>;

export interface EcosystemEntry {
  // ── Identity ──
  kind: EcosystemKind;
  slug: string; // url-safe; used to derive /public/projects/<slug>/ paths
  title: string;
  tagline: string;
  description: string;

  // ── Visuals ──
  icon: LucideIcon;
  accentClass: string; // tailwind classes for the per-project tint

  // ── Facts ──
  status: ProjectStatus;
  surfaces: readonly Surface[];
  stack: readonly string[];
  metrics: readonly Metric[];

  // ── Optional rich content ──
  highlights?: readonly string[]; // 3–6 bullet feature highlights
  /**
   * `outcomes` — short, audience-friendly callouts answering "what did this
   * actually achieve?". Rendered as 1–3 chips ABOVE the metrics inside
   * StickyCaseStudy. Optional: the field doesn't have to be present, and an
   * empty/absent value just hides the strip — zero-config opt-in.
   *
   * Why a separate field instead of more `metrics` rows? Metrics are
   * numbers ("LOC: 287K"). Outcomes are sentences for non-engineers
   * ("Live for ~3 years", "0 sev-1 incidents"). Different audience,
   * different visual treatment.
   */
  outcomes?: readonly string[];
  gallery?: readonly GalleryItem[]; // empty = no gallery; mix images + videos freely
  links?: readonly ProjectLink[]; // outbound links (live URL, repo, etc.)
  period?: string; // e.g. "2022 – Present"
  team?: string; // e.g. "Lead + 2", "Solo"
  /**
   * Optional grouped stack. If absent, the UI falls back to rendering
   * `stack` as a flat row (backward-compatible). If present, the UI shows
   * a labelled row per group instead. We keep both fields so authoring is
   * easy: project ships fast with `stack`, then upgrades to `stackGroups`
   * later for richer presentation.
   */
  stackGroups?: StackGroups;
}

// ── The data ────────────────────────────────────────────────────────────────

export const ECOSYSTEM: readonly EcosystemEntry[] = [
  // ────────────────────────────────────────────────────────────────────────
  // 1. M3 Marketplace — flagship live system
  // ────────────────────────────────────────────────────────────────────────
  {
    kind: "marketplace",
    slug: "m3-marketplace",
    title: "M3 Marketplace",
    tagline:
      "Live multi-vendor commerce platform — mobile, admin web, public storefront, and a single Serverpod backend on Google Cloud.",
    description:
      "Five surfaces, one backend. Customers shop on iOS/Android and the public web storefront; vendors and staff manage everything from a 18-module Flutter Web admin portal; the same Serverpod API powers all of them. PostgreSQL 16 with pgvector for semantic search and PostGIS for geolocation, Redis for distributed caching, PgBouncer for connection pooling, an 87-endpoint REST + WebSocket API across 91 backend services and 418 data models. Auto-scales 0–15 instances on Cloud Run with read-replica fan-out; security-audited at Grade A− and proven to handle ~50K concurrent users.",
    icon: ShoppingBag,
    accentClass: "text-accent-cyan ring-accent-cyan/30 bg-accent-cyan/15",
    status: "live",
    surfaces: ["ios", "android", "web", "admin-web", "server"],
    stack: [
      "Flutter 3.32",
      "Serverpod",
      "Dart 3.8",
      "Postgres 16",
      "pgvector",
      "PostGIS",
      "Redis",
      "PgBouncer",
      "Docker",
      "Cloud Run",
      "Cloud SQL",
      "Cloud CDN",
      "Firebase Hosting",
      "Cloud Build",
      "OpenAI",
      "FCM",
      "Shipday",
      "SendGrid",
    ],
    metrics: [
      { label: "LOC", value: "287K" },
      { label: "Endpoints", value: "87" },
      { label: "Backend services", value: "91" },
      { label: "Data models", value: "418" },
      { label: "DB migrations", value: "744" },
      { label: "Admin modules", value: "18" },
      { label: "Customer modules", value: "12" },
      { label: "Capacity", value: "~50K concurrent" },
      { label: "Period", value: "2022 – Present" },
      { label: "Team", value: "Lead + small team" },
    ],
    highlights: [
      "Multi-provider live payments — Stripe, PayPal, and the Belize Bank gateway (any card, any issuer) plus COD",
      "Real-time inventory streaming via Serverpod streams (watchCategories, watchAds) with thundering-herd protection and 500ms debounced broadcasts",
      "9-factor real-time fraud detection (0–100 risk score, velocity tracking, blocklist, 7-day clearance window)",
      "4-tier admin RBAC with separate admin token rotation (15 min access / 24h refresh), refresh-token reuse detection, and enforced TOTP 2FA",
      "PostgreSQL Row-Level Security on 18 tables, Argon2id hashing, PCI-DSS tokenization, multi-tenant isolation (TenantScopedGuard)",
      "Read-replica pool with read-after-write consistency, optimistic concurrency on inventory, and a distributed lock service (SETNX) for checkout/payment races",
      "Three-tier cache (in-memory 5 min → Drift/IndexedDB 1h → Redis 30 min) with debounced invalidation and persistent SharedPreferences on web",
      "Multi-currency commerce (BZD / USD / EUR / GBP / CAD with the official 2:1 BZD–USD peg), marketplace split payments, full subscription lifecycle",
      "Biometric login (Face ID / Touch ID), Google + Facebook social sign-in, OpenAI semantic search, FCM push, Shipday delivery integration",
      "CI/CD on Cloud Build with auto-applied migrations on cold start; Secret Manager for zero-downtime credential rotation",
    ],
    outcomes: [
      "Live for ~3 years",
      "0 sev-1 incidents",
      "~50K concurrent users sustained",
    ],
    period: "2022 – Present",
    team: "Lead + small team",
    links: [
      { label: "m3m3development.com", href: "https://m3m3development.com", kind: "live" },
      // Placeholder — owner uploads later. Kept as a `doc` link so the chip
      // strip already shows the case-study download affordance to viewers.
      { label: "Case study (PDF)", href: "/projects/m3-marketplace/case-study.pdf", kind: "doc" },
    ],
    // Grouped stack — gives the reader a mental model for which technology
    // owns which slice of the system. The flat `stack` array stays as a
    // fallback for any UI that hasn't been upgraded to consume groups yet.
    stackGroups: {
      Frontend: ["Flutter 3.32", "Dart 3.8"],
      Backend: ["Serverpod", "Cloud Run"],
      Data: ["Postgres 16", "pgvector", "PostGIS", "Redis", "PgBouncer", "Cloud SQL"],
      Infra: ["Docker", "Cloud Build", "Cloud CDN", "Firebase Hosting"],
      Integrations: ["OpenAI", "FCM", "Shipday", "SendGrid"],
    },
    gallery: [
      { kind: "image", src: "/projects/m3-marketplace/home-page.jpeg", alt: "M3 customer mobile app — home", caption: "Mobile · Home" },
      { kind: "image", src: "/projects/m3-marketplace/product-store.jpeg", alt: "M3 customer mobile app — product store", caption: "Mobile · Storefront" },
      { kind: "image", src: "/projects/m3-marketplace/products.jpeg", alt: "M3 customer mobile app — products list", caption: "Mobile · Products" },
      { kind: "image", src: "/projects/m3-marketplace/food-storefront.jpeg", alt: "M3 customer mobile app — food storefront", caption: "Mobile · Food vertical" },
      { kind: "image", src: "/projects/m3-marketplace/dashboard.png", alt: "M3 admin web — dashboard", caption: "Admin · Dashboard" },
      { kind: "image", src: "/projects/m3-marketplace/orders-page.png", alt: "M3 admin web — orders", caption: "Admin · Orders" },
      { kind: "image", src: "/projects/m3-marketplace/inventory-page.png", alt: "M3 admin web — inventory", caption: "Admin · Inventory" },
      { kind: "image", src: "/projects/m3-marketplace/product-management-page.png", alt: "M3 admin web — product management", caption: "Admin · Products" },
      { kind: "image", src: "/projects/m3-marketplace/product-approval-page.png", alt: "M3 admin web — product approval", caption: "Admin · Approvals" },
      { kind: "image", src: "/projects/m3-marketplace/storefront-management-page.png", alt: "M3 admin web — storefront management", caption: "Admin · Storefront mgmt" },
      { kind: "image", src: "/projects/m3-marketplace/marketing-page.png", alt: "M3 admin web — marketing", caption: "Admin · Marketing" },
      { kind: "image", src: "/projects/m3-marketplace/customer-page.png", alt: "M3 admin web — customer detail", caption: "Admin · Customers" },
      { kind: "image", src: "/projects/m3-marketplace/reviews-page.png", alt: "M3 admin web — reviews", caption: "Admin · Reviews" },
      { kind: "image", src: "/projects/m3-marketplace/appointments-page-view.png", alt: "M3 admin web — appointments", caption: "Admin · Appointments" },
      { kind: "image", src: "/projects/m3-marketplace/appointment-type-products.png", alt: "M3 admin web — appointment-type products", caption: "Admin · Appointment products" },
      { kind: "image", src: "/projects/m3-marketplace/food-products-page.png", alt: "M3 admin web — food products", caption: "Admin · Food products" },
      { kind: "image", src: "/projects/m3-marketplace/services-page-food-verticals.png", alt: "M3 admin web — services for food verticals", caption: "Admin · Services" },
      { kind: "image", src: "/projects/m3-marketplace/platform-main-page.png", alt: "M3 platform admin — main", caption: "Platform · Main" },
      { kind: "image", src: "/projects/m3-marketplace/platform-dashboard.png", alt: "M3 platform admin — dashboard", caption: "Platform · Dashboard" },
      { kind: "image", src: "/projects/m3-marketplace/platform-metrics-page.png", alt: "M3 platform admin — metrics", caption: "Platform · Metrics" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 2. TraySoft Payment Module — production package, can be reused
  // ────────────────────────────────────────────────────────────────────────
  {
    kind: "payments",
    slug: "traysoft",
    title: "TraySoft Payment Module",
    tagline:
      "Reusable Serverpod + Flutter payment package — four providers, PCI-DSS tokenization, 543 automated tests at 78% coverage (QA Grade A).",
    description:
      "Pluggable payment SDK powering M3 Marketplace and structured to drop into any Serverpod backend. Four providers (Stripe, PayPal, Belize Bank gateway, COD) behind one unified API, with real-time fraud detection, marketplace split payments, dynamic admin-configurable taxes (Belize GST 12.5%, Hotel Tax 9%), service fees, vendor payout management (bank / Stripe Connect / PayPal), shipping vendor integration with HMAC-SHA256 webhooks, AVS, circuit-breaker + retry resilience, and a full subscription lifecycle. 17,855 lines of operator and integrator documentation.",
    icon: CreditCard,
    accentClass: "text-accent-violet ring-accent-violet/30 bg-accent-violet/15",
    status: "live",
    surfaces: ["server", "package", "web"],
    stack: [
      "Serverpod 2.9",
      "Dart",
      "Postgres 16",
      "Redis 6.2",
      "Stripe",
      "PayPal",
      "Belize Bank",
      "Docker",
    ],
    metrics: [
      { label: "Tests", value: "543" },
      { label: "Coverage", value: "78%" },
      { label: "QA Grade", value: "A" },
      { label: "Providers", value: "4" },
      { label: "Currencies", value: "5" },
      { label: "Foreign keys", value: "29" },
      { label: "Docs", value: "17,855 lines" },
      { label: "Period", value: "2024 – Present" },
      { label: "Team", value: "Solo" },
    ],
    highlights: [
      "Real-time fraud engine — 9 risk factors (geolocation, device fingerprint, velocity, blocklist, behavioral) with 0–100 risk score",
      "PCI-DSS tokenization end-to-end (Stripe.js / PayPal SDK client-side; zero raw card storage)",
      "Marketplace split payments with atomic commission distribution, configurable rates, and a 7-day fraud-clearance window",
      "Dynamic admin-configurable tax engine: Belize GST 12.5%, Hotel Tax 9%, scheduled effective dates, service fees (platform / convenience / COD)",
      "Vendor payout management — bank, Stripe Connect, PayPal — with AVS, scheduled payouts, and reconciliation",
      "Shipping vendor integration with HMAC-SHA256 webhooks, auto-tracking, and external delivery-app support",
      "Multi-currency settlement (BZD / USD / EUR / GBP / CAD) with the official 2:1 BZD–USD peg and per-currency tax computation",
      "Circuit breaker + retry resilience, atomic database transactions, optimized relation loading (N+1 prevention), 29 foreign-key constraints",
      "Distributed Redis-backed rate limiting and caching with graceful in-memory fallback for local dev",
      "Subscription lifecycle: trials, pause/resume, single-active enforcement, automated invoicing, webhook-driven",
      "Timing-safe webhook signature enforcement (Stripe, Belize Bank, SendGrid)",
      "543 automated tests (389 unit + 154 integration), 78% coverage, full QA report",
    ],
    outcomes: [
      "543 tests · 78% cov · QA Grade A",
      "PCI-DSS tokenized",
      "Webhooks audited",
    ],
    period: "2024 – Present",
    team: "Solo",
    links: [
      // Placeholder — owner uploads PDF case study later.
      { label: "Case study (PDF)", href: "/projects/traysoft/case-study.pdf", kind: "doc" },
    ],
    gallery: [
      { kind: "video", src: "/projects/traysoft/belize-bank-live-payment.mp4", caption: "Live Belize Bank payment flow" },
      { kind: "image", src: "/projects/traysoft/payment-module-fraud-page.png", alt: "TraySoft fraud detection page", caption: "Fraud detection" },
      { kind: "image", src: "/projects/traysoft/fraud-page-settings.png", alt: "TraySoft fraud-detection settings", caption: "Fraud · Settings" },
      { kind: "image", src: "/projects/traysoft/fraud-risk-logs.png", alt: "TraySoft fraud risk-score logs", caption: "Fraud · Risk logs" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 3. SIF IT System — internal-prod at Belize Social Investment Fund
  // ────────────────────────────────────────────────────────────────────────
  {
    kind: "internal",
    slug: "sif-it-system",
    title: "SIF IT System",
    tagline:
      "Internal IT system for the Belize Social Investment Fund — built and maintained as part of my sole IT-administrator role.",
    description:
      "Multi-platform Serverpod / Flutter system in active internal production at the Belize Social Investment Fund (a government-affiliated development institution). Barcode-based asset/ID generation, PDF report printing, FL Charts analytics dashboards, large data sets via DataTable2, and Serverpod Streams for real-time updates. Structured endpoint architecture (auth, dashboard, items, products), role-based auth, and a Windows-friendly local dev setup documented for staff hand-off. Sits alongside a companion BSIF MIS desktop application (Qt 6.8 / QML) covering internal management workflows.",
    icon: LayoutDashboard,
    accentClass: "text-emerald-300 ring-emerald-300/30 bg-emerald-300/10",
    status: "internal-prod",
    surfaces: ["web", "admin-web", "desktop", "server"],
    stack: [
      "Serverpod 3.2",
      "Flutter 3.32",
      "Dart",
      "Postgres",
      "Redis",
      "FL Charts",
      "DataTable2",
      "Qt 6.8 / QML",
    ],
    metrics: [
      { label: "Audience", value: "Government-affiliated" },
      { label: "Owner", value: "BSIF" },
      { label: "Period", value: "Aug 2024 – Present" },
      { label: "Team", value: "Solo · Sole IT" },
      { label: "Status", value: "Internal · Production" },
    ],
    highlights: [
      "Barcode-driven asset and ID generation with PDF report export",
      "Live analytics dashboard (FL Charts) backed by Serverpod Streams",
      "DataTable2 for large institutional datasets with multi-field search and filtering",
      "Companion BSIF MIS desktop app in Qt 6.8 / QML — modular page architecture, event simulation for management workflows",
      "Role-based auth (admin / staff) with documented Windows + WSL2 dev workflow",
      "Built end-to-end as the sole IT administrator — requirements, design, build, deploy, support",
    ],
    outcomes: [
      "Daily active use at BSIF",
      "Government-affiliated production",
      "Zero downtime since launch",
    ],
    period: "Aug 2024 – Present",
    team: "Solo · Sole IT",
    gallery: [], // public/projects/sif-it-system/
  },

  // ────────────────────────────────────────────────────────────────────────
  // 4. BeliBet — gambling-industry experience, WIP
  // ────────────────────────────────────────────────────────────────────────
  {
    kind: "betting",
    slug: "belibet",
    title: "BeliBet",
    tagline:
      "Sports betting platform — Serverpod backend, Flutter mobile + web client, admin panel. Direct gambling-industry build experience.",
    description:
      "Full-stack betting platform structured around the same Serverpod 3.x stack as M3 Marketplace. Customer mobile and web client, separate admin web panel for event/betting management, real-time WebSocket event streaming, user wallet auto-created on signup, SHA-256 hashed authentication with email validation. Same operational and regulatory shape as BGLL — a direct match for the Fi We Boledo team.",
    icon: Trophy,
    accentClass: "text-accent-violet ring-accent-violet/30 bg-accent-violet/15",
    status: "wip",
    surfaces: ["ios", "android", "web", "admin-web", "server"],
    stack: ["Serverpod 2.9", "Flutter", "Dart", "Postgres", "Redis", "WebSockets"],
    metrics: [
      { label: "Industry", value: "Gambling" },
      { label: "Streaming", value: "Real-time" },
      { label: "Auth", value: "SHA-256 + email" },
      { label: "Wallet", value: "Auto-created" },
      { label: "Period", value: "2024 – Present" },
      { label: "Team", value: "Solo" },
    ],
    highlights: [
      "Same operational profile as BGLL's Fi We Boledo — regulated wagering + financial reconciliation, directly transferable experience",
      "Real-time WebSocket event/odds streaming via Serverpod streams",
      "User wallet auto-created on signup with internal ledger semantics",
      "Admin panel for event/betting management — separate auth boundary from customer app",
      "SHA-256 hashed auth with email validation; password reset flow",
    ],
    outcomes: ["v1 in production · v2 building"],
    period: "2024 – Present",
    team: "Solo",
    gallery: [
      { kind: "video", src: "/projects/belibet/belibet-view.mp4", caption: "BeliBet walkthrough" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 5. BelizeHomes — real-estate marketplace + CRM, WIP
  // ────────────────────────────────────────────────────────────────────────
  {
    kind: "real-estate",
    slug: "belizehomes",
    title: "BelizeHomes",
    tagline:
      "Real-estate marketplace and CRM with property listings, agent tools, an image processing pipeline, and a Kanban deal-flow board.",
    description:
      "Multi-surface Serverpod 3.x project: customer mobile (Flutter), agent admin web (Flutter Web with WASM build), and a shared backend. Image upload pipeline with server-side resize and variant generation, endpoint-layer RBAC, OAuth-ready Serverpod auth, Kanban-style pipeline UI (appflowy_board), Isar offline sync for agents in the field, Syncfusion charts for portfolio analytics, a rich-text editor for listings, PDF generation for offer letters and reports, reactive forms, and Pluto Grid data tables. Architecture and pipeline are in place; domain coverage is expanding.",
    icon: Building2,
    accentClass: "text-accent-blue ring-accent-blue/30 bg-accent-blue/15",
    status: "wip",
    surfaces: ["ios", "android", "admin-web", "server"],
    stack: [
      "Serverpod 3.2",
      "Flutter 3.32",
      "Dart",
      "Postgres",
      "Redis",
      "Isar",
      "Syncfusion",
      "appflowy_board",
      "Pluto Grid",
    ],
    metrics: [
      { label: "Surfaces", value: "Mobile · Admin · API" },
      { label: "Image pipeline", value: "Resize + variants" },
      { label: "Offline sync", value: "Isar" },
      { label: "Period", value: "2024 – Present" },
      { label: "Team", value: "Solo" },
    ],
    highlights: [
      "Image upload pipeline with server-side resize and multi-resolution variant generation",
      "Kanban pipeline (appflowy_board) for agent-side deal tracking",
      "Isar offline-first sync so agents can work properties without connectivity",
      "Syncfusion charts for portfolio analytics; Pluto Grid for large-listing tables",
      "Rich-text listing editor + PDF generation for offer letters and printable reports",
      "Endpoint-layer RBAC, OAuth-ready Serverpod auth, reactive forms",
      "Flutter Web admin builds to WebAssembly for offline-capable agent tooling",
    ],
    outcomes: ["v1 in production · v2 building"],
    period: "2024 – Present",
    team: "Solo",
    gallery: [
      { kind: "video", src: "/projects/belizehomes/belize-homes-app-video-walkthrough.mp4", caption: "BelizeHomes app walkthrough" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // M3 Runner — driver / runman delivery app + admin runner-ops integration
  // ────────────────────────────────────────────────────────────────────────
  {
    kind: "logistics",
    slug: "m3-runner",
    title: "M3 Runner",
    tagline:
      "Driver / runman delivery app paired with a full runner-operations console inside the M3 Marketplace admin web — same backend, two surfaces.",
    description:
      "Flutter mobile app for runners (drivers and runmen) to accept jobs, navigate, capture proof of delivery, chat with customers, and track earnings — wired into the same Serverpod backend that powers M3 Marketplace. The platform side lives inside the M3 admin web at platform_admin/shipping/runner_ops: a runner-ops dashboard for jobs, fees, driver usage, fraud, reviews, service areas, and local-runner management. One codebase shared with the customer + admin apps, separate auth boundary for runners, and a dispatch pipeline that ties customer orders to driver assignments end-to-end.",
    icon: Truck,
    accentClass: "text-accent-violet ring-accent-violet/30 bg-accent-violet/15",
    status: "wip",
    surfaces: ["ios", "android", "admin-web", "server"],
    stack: [
      "Flutter 3.32",
      "Serverpod 3.2",
      "Dart 3.8",
      "Postgres 16",
      "Redis",
      "BLoC / Cubit",
      "Google Maps",
    ],
    metrics: [
      { label: "Runner modules", value: "16" },
      { label: "Admin runner-ops cubits", value: "8+" },
      { label: "Surfaces", value: "iOS · Android · Admin · API" },
      { label: "Period", value: "2024 – Present" },
      { label: "Team", value: "Solo" },
    ],
    highlights: [
      "Driver app with deliveries, my-jobs queue, runner chat, post-job, runman directory, service areas, earnings, history, and invoices",
      "Pagination cursor uses `(createdAt, id)` tuple instead of pure timestamp — eliminates duplicates on rapid inserts (M3RUNNER_AUDIT_FIXES C2)",
      "Server-side invoice pagination with id-dedup on the client cubit; scroll-bottom triggers loadMore",
      "Admin runner-ops console: jobs dashboard, runner-fee config, driver-usage analytics, driver-fees review, runner reviews moderation, service-area + local-runner management",
      "Runner chat with image upload, optimistic send, and proper failure rollback (`isSending` reset on error)",
      "Drivers are platform-scoped by design (no `tenantId` on Driver row); optional `tenantId` param on `getMyActiveDeliveries` lets enterprise/branded apps scope assignments to a single tenant",
      "Proof-of-delivery uploads land in `pink_server/uploads/runner-job-proofs` with audit-logged retention",
      "BuildContext-across-async-gap audited and patched (ScaffoldMessenger.maybeOf + messenger.mounted guard)",
    ],
    outcomes: ["v1 in production · v2 building"],
    period: "2024 – Present",
    team: "Solo",
    gallery: [
      { kind: "video", src: "/projects/m3-runner/m3-runner-driver-view.mp4", caption: "Driver view — accept job + run delivery" },
      { kind: "video", src: "/projects/m3-runner/m3-runner-app-customer-view.mp4", caption: "Customer view — track delivery" },
      { kind: "image", src: "/projects/m3-runner/m3-runner-ops-page.png", alt: "Admin runner-ops dashboard inside M3 admin web", caption: "Admin · Runner ops" },
      { kind: "image", src: "/projects/m3-runner/m3-runner-settings-page.png", alt: "M3 Runner driver settings page", caption: "Driver · Settings" },
    ],
  },
] as const;

/**
 * `FEATURED_ECOSYSTEM` — subset shown on the HOMEPAGE bento grid. We curate
 * the 4 most-portfolio-worthy entries (live + internal-prod + the standout
 * gambling-industry WIP) so the homepage stays focused. The full /projects
 * page still renders all of `ECOSYSTEM` via StickyCaseStudy.
 */
export const FEATURED_ECOSYSTEM: readonly EcosystemEntry[] = ECOSYSTEM.filter(
  (e) =>
    e.slug === "m3-marketplace" ||
    e.slug === "traysoft" ||
    e.slug === "sif-it-system" ||
    e.slug === "belibet",
);

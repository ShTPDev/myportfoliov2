/**
 * skills.ts — data for the About / Skills section.
 *
 * Real stack from CV (May 2026 IT Manager application). Includes both the
 * full-stack engineering side (M3M3 Marketplace) and the IT Operations side
 * (sole IT authority at BSIF).
 *
 * Concept showcase:
 *  - Plain TS module exporting typed arrays — Next.js compiles this into the
 *    server bundle (or static HTML) without any client cost.
 *  - **Literal-string union type** (`SkillCategory`) — pins the allowed
 *    category values at compile time, so a typo like `"Frontned"` is caught
 *    by tsc instead of slipping into the UI silently.
 *  - **`as const`** on the array → each object's fields keep their literal
 *    types, so `SKILLS[0].name` is `"Network Architecture"` (the exact
 *    string), not just the wider `string` type.
 *  - Splitting by category keeps the UI grouping flexible — components can
 *    `groupBy` or render filtered subsets without re-shaping the data.
 */

// A union of string literals. Every Skill must pick one of these — TS will
// reject any other value. Adding a new category = edit this one line.
export type SkillCategory =
  | "Infrastructure"
  | "Cloud & DevOps"
  | "Backend"
  | "Frontend"
  | "Data & Integration"
  | "Security"
  | "IT Operations";

// `interface` describes the shape of one skill entry. Exporting it lets UI
// components type their props as `Skill` instead of redefining the shape.
export interface Skill {
  name: string;
  category: SkillCategory;
  description: string;
}

// `readonly Skill[]` — the array reference can't be reassigned and items
// can't be mutated at runtime by accident. Combined with `as const` below,
// every individual field also gets its literal type preserved.
export const SKILLS: readonly Skill[] = [
  // ── Infrastructure ──────────────────────────────────────────────────────
  {
    name: "Network Architecture",
    category: "Infrastructure",
    description:
      "Designed and maintained multi-segment LAN with redundant ISP failover at BSIF.",
  },
  {
    name: "Active Directory",
    category: "Infrastructure",
    description:
      "User/group/OU administration, GPO policy, and service-account hygiene.",
  },

  // ── Cloud & DevOps ──────────────────────────────────────────────────────
  {
    name: "Google Cloud Run",
    category: "Cloud & DevOps",
    description:
      "Containerized Serverpod backend deployed as autoscaling Cloud Run services.",
  },
  {
    name: "Cloud SQL (PostgreSQL)",
    category: "Cloud & DevOps",
    description:
      "Managed Postgres with automated backups, replicas, and private IP networking.",
  },
  {
    name: "Docker",
    category: "Cloud & DevOps",
    description:
      "Reproducible build + dev environments; multi-stage images for slim deploys.",
  },
  {
    name: "Redis",
    category: "Cloud & DevOps",
    description:
      "Session store, rate-limit counters, and queue backbone for async jobs.",
  },
  {
    name: "PgBouncer",
    category: "Cloud & DevOps",
    description:
      "Transaction-mode pooling in front of Cloud SQL to keep connection counts sane.",
  },

  // ── Backend ─────────────────────────────────────────────────────────────
  {
    name: "Serverpod (Dart)",
    category: "Backend",
    description:
      "Type-safe Dart backend with code-gen RPC, auth, and streaming endpoints.",
  },
  {
    name: "REST APIs",
    category: "Backend",
    description:
      "Versioned, documented HTTP APIs with idempotent writes and audit trails.",
  },
  {
    name: "WebSockets",
    category: "Backend",
    description:
      "Live order status and chat channels powered by Serverpod streams.",
  },
  {
    name: "PHP",
    category: "Backend",
    description:
      "Legacy LAMP integrations and admin tooling for vendor systems.",
  },
  {
    name: "Python",
    category: "Backend",
    description:
      "ETL scripts, data wrangling, and one-off automation across reports.",
  },
  {
    name: "JavaScript",
    category: "Backend",
    description:
      "Node tooling and lightweight services around the main Dart stack.",
  },

  // ── Frontend ────────────────────────────────────────────────────────────
  {
    name: "Flutter (mobile · web · desktop)",
    category: "Frontend",
    description:
      "Single codebase shipping to Android, iOS, web, and desktop for M3M3 Marketplace.",
  },
  {
    name: "Dart",
    category: "Frontend",
    description:
      "Sound null-safety, isolates, and async streams across client + server.",
  },
  {
    name: "BLoC / Cubit",
    category: "Frontend",
    description:
      "Predictable state management with separation of UI from business logic.",
  },
  {
    name: "GoRouter",
    category: "Frontend",
    description:
      "Declarative routing, deep links, and auth-aware navigation guards.",
  },

  // ── Data & Integration ──────────────────────────────────────────────────
  {
    name: "PostgreSQL 16",
    category: "Data & Integration",
    description:
      "Schema design, indexing, partitioning, and migrations for transactional workloads.",
  },
  {
    name: "SQL Server",
    category: "Data & Integration",
    description:
      "T-SQL, stored procedures, and reporting against legacy line-of-business data.",
  },
  {
    name: "pgvector",
    category: "Data & Integration",
    description:
      "Vector similarity search for semantic product and document lookup.",
  },
  {
    name: "PostGIS",
    category: "Data & Integration",
    description:
      "Geospatial queries for delivery zones, runner routing, and coverage maps.",
  },
  {
    name: "ETL Pipelines",
    category: "Data & Integration",
    description:
      "Scheduled extract / transform / load jobs feeding analytics and BI dashboards.",
  },
  {
    name: "Celigo iPaaS",
    category: "Data & Integration",
    description:
      "Cloud integrations connecting NetSuite, Shopify, and partner APIs.",
  },
  {
    name: "Power BI",
    category: "Data & Integration",
    description:
      "Operational dashboards over Postgres + spreadsheet sources for leadership.",
  },

  // ── Security ────────────────────────────────────────────────────────────
  {
    name: "Multi-Factor Authentication",
    category: "Security",
    description:
      "Enforced TOTP / SMS step-up across admin and high-risk user flows.",
  },
  {
    name: "Biometric Auth",
    category: "Security",
    description:
      "On-device FaceID / fingerprint unlock layered on top of token sessions.",
  },
  {
    name: "JWT",
    category: "Security",
    description:
      "Short-lived access + rotating refresh tokens with key-id rollover.",
  },
  {
    name: "Role-Based Access Control",
    category: "Security",
    description:
      "Granular admin / vendor / runner / customer permissions enforced server-side.",
  },
  {
    name: "PCI-DSS Tokenization",
    category: "Security",
    description:
      "Card data never touches our servers — provider tokens stored in their place.",
  },
  {
    name: "Fraud Detection",
    category: "Security",
    description:
      "Velocity, geo, and device-fingerprint heuristics on payment events.",
  },

  // ── IT Operations ───────────────────────────────────────────────────────
  {
    name: "Procurement",
    category: "IT Operations",
    description:
      "RFQs, hardware/software sourcing, and budget-aligned purchase decisions.",
  },
  {
    name: "Vendor Management",
    category: "IT Operations",
    description:
      "Contract negotiation, SLA tracking, and quarterly performance reviews.",
  },
  {
    name: "Asset Lifecycle",
    category: "IT Operations",
    description:
      "Inventory, deployment, refresh cycles, and end-of-life decommissioning.",
  },
  {
    name: "SLA Management",
    category: "IT Operations",
    description:
      "Defining, measuring, and enforcing uptime + response targets with vendors.",
  },
  {
    name: "IT Policy",
    category: "IT Operations",
    description:
      "Acceptable-use, change-management, and incident-response documentation.",
  },
  {
    name: "L1 / L2 Support",
    category: "IT Operations",
    description:
      "Ticket triage, on-the-floor troubleshooting, and root-cause escalation.",
  },
] as const;

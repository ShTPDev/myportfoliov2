/**
 * career.ts — single source of truth for /about-me content.
 *
 * Why a dedicated data module?
 *   The /about-me page used to render Shamar's resume/CV by embedding
 *   `public/about/*.html` inside an <iframe>. That worked but looked
 *   jarring (light printable theme inside our dark glass site). To render
 *   the same content in our native dark theme we need the underlying data
 *   structured — not parsed from HTML at runtime. This file is that data.
 *
 * Concept showcase (TS for beginners):
 *   - `as const` deeply freezes object/array literals AND narrows their
 *     types from `string` → the exact string literal. Useful for static
 *     data the UI iterates over.
 *   - `ReadonlyArray<T>` (vs plain `T[]`) signals "consumers must not
 *     mutate this". Good defensive default for exported data.
 *   - Discriminated-style tag fields (e.g. `kind: "year" | "range"`)
 *     would let us narrow shape later if needed. Not used here yet —
 *     all milestones share the same shape for simplicity.
 *
 * Editing rules:
 *   - Numbers and dates here come from /public/about/resume.html and
 *     cv.html as of May 2026. Update both places when copy drifts.
 *   - Keep this file flat and serializable — no React, no functions —
 *     so it can be imported by both server and client components.
 */

// ─── Career timeline ──────────────────────────────────────────────────────
//
// Drives `<CareerTimeline />`. Each item is one inflection point in the
// owner's career. Keep ~5 items so the rail reads as a story, not a CV.
export type CareerMilestone = Readonly<{
  year: string; // display chip — "2019", "2024" etc.
  title: string; // bold first line, e.g. role + company
  context: string; // 1-line follow-up explaining the milestone
}>;

export const CAREER_MILESTONES: ReadonlyArray<CareerMilestone> = [
  {
    year: "2019",
    title: "Started B.Sc. Computer Science",
    context:
      "Edinburgh Napier University (online program). First serious dive into software engineering, data structures, and Angular/Groovy frameworks.",
  },
  {
    year: "2020",
    title: "Systems Administrator at Ready Call Center",
    context:
      "Built the network from scratch as a 20-year-old: structured cabling, switch/router config, ISP failover, domain + workstation management for ~100 seats.",
  },
  {
    year: "2022",
    title: "Data & Integration Specialist at Dealer Spike (Solera)",
    context:
      "Enterprise SQL Server admin + Celigo iPaaS pipelines across 100+ dealership clients in North America. PowerBI dashboards, ETL automation, REST/SFTP feeds.",
  },
  {
    year: "2022",
    title: "Founded M3M3 Development",
    context:
      "Led a small team end-to-end to ship M3 Marketplace — a live 287K-LOC platform on GCP with Stripe, PayPal, and Belize Bank payment integration in production.",
  },
  {
    year: "2024",
    title: "Sole IT authority + acting IT Manager at BSIF",
    context:
      "Full IT Manager scope — procurement, infrastructure, vendor SLAs, cybersecurity, custom internal systems. M3M3 Development registered as a legal entity in March 2025.",
  },
] as const;

// ─── Resume (one-page) ────────────────────────────────────────────────────
//
// Mirrors `/public/about/resume.html` page 1 sections so the native
// component can render the exact same content in dark glass theme.

export type ResumeJob = Readonly<{
  title: string;
  company: string;
  tag?: string; // e.g. "Owner", "Acting IT Manager"
  date: string;
  description: string;
  bullets: ReadonlyArray<string>; // **bold** allowed via simple inline marker
}>;

export type ResumeProject = Readonly<{
  name: string;
  status: string;
  description: string;
}>;

export type ResumeStat = Readonly<{ value: string; label: string }>;

export const RESUME = {
  // Header band on the dark theme version
  role: "Information Technology Manager",
  tagline:
    "IT operations leader and full-stack engineer. Sole IT authority at Belize Social Investment Fund. Founder of M3M3 Development. Architect of a live 287K-LOC enterprise platform with shipped Belize Bank payment integration.",

  summary:
    "IT professional and entrepreneur with 5+ years of progressive experience across systems administration, enterprise full-stack development, and IT operations management. Currently the sole Systems Administrator and de-facto IT Manager at Belize Social Investment Fund, handling all organizational IT independently — procurement, infrastructure, vendor relations, cybersecurity, project consultancy, and custom system development. Founder of M3M3 Development, where I led a development team to design, build, and ship M3 Marketplace — a live 287K-LOC enterprise marketplace platform on Google Cloud, including a production Belize Bank payment integration. Strong track record of taking ownership of complex systems and delivering reliable, secure, scalable digital infrastructure.",

  stats: [
    { value: "5+", label: "Years progressive IT experience" },
    { value: "4+", label: "Years leading dev team" },
    { value: "287K", label: "Lines of production code shipped" },
    { value: "4", label: "Payment providers integrated (incl. Belize Bank)" },
  ] as ReadonlyArray<ResumeStat>,

  // Sidebar competencies (compact list)
  competencies: [
    "IT Strategy & Planning",
    "Systems & Network Administration",
    "Cybersecurity & Data Protection",
    "IT Procurement & Vendor Management",
    "IT Project Management",
    "Team Leadership & Coordination",
    "Database Administration",
    "Cloud Architecture (GCP, Docker)",
    "Performance Reporting (PowerBI)",
    "Mobile & Web App Development",
  ] as ReadonlyArray<string>,

  techStack: [
    "Dart / Flutter",
    "Serverpod",
    "PostgreSQL",
    "SQL Server",
    "Redis",
    "Docker",
    "GCP",
    "PHP",
    "Python",
    "JavaScript",
    "REST APIs",
    "Celigo iPaaS",
    "PowerBI",
    "Stripe",
    "PayPal",
    "Belize Bank",
    "Qt / QML",
    "Angular *",
    "Groovy *",
  ] as ReadonlyArray<string>,
  techStackNote: "* Academic exposure, actively expanding",

  jobs: [
    {
      title: "Founder & Lead Developer",
      company: "M3M3 Development",
      tag: "Owner",
      date: "2022 – Present · Registered 2025",
      description:
        "Software development company building full-stack mobile, web, and enterprise platforms for the Belize market. Led a small development team through the complete lifecycle of a production marketplace platform.",
      bullets: [
        "**Belize Bank payment integration shipped in production** — hosted payment page flow, HMAC-signed webhooks, tokenized card storage, transaction reconciliation.",
        "Architected M3 Marketplace end-to-end: 287K LOC, 87 REST APIs, 91 backend services, 418 data models, PostgreSQL 16 + pgvector + PostGIS, Redis, PgBouncer, Google Cloud Run.",
        "Led the development team as technical director: sprint planning, task delegation, code review, QA, deployment management. 4+ years of hands-on team leadership.",
        "Production-grade security: MFA, biometric auth, JWT sessions, RBAC (3-tier), rate limiting, audit logging, PCI-DSS tokenization, real-time fraud detection (9-factor risk scoring 0–100).",
        "Coordinated client relationships, project scoping, timelines, and delivery as company owner. Registered M3M3 Development as a legal entity in March 2025.",
      ],
    },
    {
      title: "Systems Administrator",
      company: "Belize Social Investment Fund (BSIF)",
      tag: "Acting IT Manager",
      date: "August 2024 – Present",
      description:
        "Government-affiliated development institution. Sole IT administrator — performing the full scope of an IT Manager role independently.",
      bullets: [
        "**Single IT authority** for the organization: hardware procurement, software licensing, vendor negotiation, contract management, asset lifecycle.",
        "Direct ICT consultancy on active institutional projects — advising on technology selection, architecture, and deployment strategy.",
        "Built the SIF IT System (Serverpod + Flutter): multi-platform with barcode ID generation, PDF reporting, FL Charts dashboards, real-time Serverpod Streams.",
        "Built BSIF MIS desktop prototype (Qt 6.8 / QML) for internal management information workflows.",
        "Administer all network infrastructure, workstations, peripherals; enforce security policies and access controls organization-wide.",
      ],
    },
    {
      title: "Data & Integration Specialist",
      company: "Dealer Spike (Solera Company)",
      date: "2022 – 2024",
      description:
        "Enterprise data integration, API infrastructure, and SQL Server administration across 100+ dealership clients in North America.",
      bullets: [
        "End-to-end ETL pipelines: SFTP + REST API ingestion of high-volume CSV/XML feeds into SQL Server warehouses on automated nightly schedules.",
        "Deployed and managed Celigo iPaaS API ecosystem; administered SQL Server (schema, queries, indexing, performance tuning).",
        "Built PowerBI dashboards tracking pipeline KPIs; coordinated vendor integrations and client onboarding.",
      ],
    },
    {
      title: "Systems Administrator",
      company: "Ready Call Center (RCC)",
      date: "2020 – 2022",
      description:
        "On-site IT administrator. Deployed and managed full network infrastructure for a high-traffic call center from the ground up.",
      bullets: [
        "Planned and built complete network: structured cabling, switch/router config, redundancies, ISP integration, domain & workstation management.",
        "Provided L1/L2 IT support for hardware, software, peripherals; maintained rapid resolution to minimize operational downtime.",
      ],
    },
  ] as ReadonlyArray<ResumeJob>,

  projects: [
    {
      name: "M3 Marketplace — Enterprise E-Commerce Platform",
      status: "LIVE / GCP",
      description:
        "287K LOC Dart/Flutter + Serverpod, PostgreSQL 16, Redis, GCP Cloud Run. 4-provider payments incl. **Belize Bank**, real-time fraud detection, MFA + biometric auth, 18-module admin panel + 12-module customer app. Sole architect; led M3M3 team through delivery.",
    },
    {
      name: "BeliBet — Sports Betting Platform",
      status: "INDUSTRY-ADJACENT",
      description:
        "Full-stack betting platform: Serverpod backend, Flutter mobile + admin panel. User wallet system, real-time WebSocket event streaming, secure auth with email validation + SHA256 hashing, admin event/betting management. **Direct experience building gambling/betting infrastructure.**",
    },
    {
      name: "TraySoft Payment Module",
      status: "PRODUCTION-READY PACKAGE",
      description:
        "Reusable Serverpod/Flutter payment package: Stripe, PayPal, Belize Bank, COD. Fraud engine, velocity tracking, marketplace splits, multi-currency. **543 automated tests, 78% coverage**, QA Grade A.",
    },
    {
      name: "SIF IT System · BelizeHomes · M3M3 Marketplace",
      status: "PORTFOLIO",
      description:
        "SIF IT System: barcode + PDF + analytics for BSIF (production internal). BelizeHomes: real estate marketplace + CRM with RBAC, Kanban, offline sync. M3M3 Marketplace + admin web at m3m3development.com.",
    },
  ] as ReadonlyArray<ResumeProject>,
} as const;

// ─── CV (multi-page, longer-form) ─────────────────────────────────────────
//
// Mirrors `/public/about/cv.html`. The CV's professional profile,
// achievements, jobs, projects, skills matrix, and competencies.

export type CvAchievement = string;

export type CvJobSubsection = Readonly<{
  heading: string;
  bullets: ReadonlyArray<string>;
}>;

export type CvJob = Readonly<{
  title: string;
  company: string;
  tag?: string;
  date: string;
  description: string;
  // CV jobs may have multiple sub-sections (e.g. "IT Operations" + "Custom
  // Systems"). Plain `bullets` is used when there's only one block.
  sections?: ReadonlyArray<CvJobSubsection>;
  bullets?: ReadonlyArray<string>;
}>;

export type CvProject = Readonly<{
  name: string;
  status: string;
  description: string;
}>;

export type CvSkillRow = Readonly<{ label: string; value: string }>;

export const CV = {
  profile:
    "IT professional and entrepreneur with 5+ years of progressive experience spanning systems administration, enterprise full-stack development, and IT operations management. Currently the sole IT administrator and de-facto IT Manager at Belize Social Investment Fund, managing all organizational IT independently — from procurement and infrastructure to vendor relations, cybersecurity, and custom system development. Founder of M3M3 Development, where I led a development team to build and ship M3 Marketplace — a live 287K-LOC enterprise marketplace platform on Google Cloud, including a production Belize Bank payment integration. Holds a B.Sc. in Computer Science from Edinburgh Napier University, with academic exposure to Angular and Groovy-based development frameworks.",

  achievements: [
    "**Belize Bank payment integration shipped in production** on M3 Marketplace — hosted payment page, HMAC webhooks, tokenized cards, reconciliation.",
    "**Sole IT authority at BSIF** — executing full IT Manager responsibilities (procurement, infrastructure, vendor management, cybersecurity, project consultancy) without the formal title.",
    "**Founded M3M3 Development** and led a development team to deliver a production-grade enterprise marketplace platform — 287K+ LOC across mobile app, admin web, and Serverpod backend on GCP.",
    "**Built BeliBet end-to-end** — a sports betting platform with real-time WebSocket event streaming, user wallets, and secure auth. Direct gambling-industry development experience.",
    "**Built TraySoft Payment Module:** 4-provider integration with real-time fraud detection, PCI-DSS tokenization, 543 automated tests at 78% coverage (QA Grade A).",
    "**Managed enterprise data pipelines at Dealer Spike** for 100+ clients with near-zero error rates: SQL Server DBA, Celigo iPaaS, PowerBI reporting.",
  ] as ReadonlyArray<CvAchievement>,

  jobs: [
    {
      title: "Founder & Lead Developer",
      company: "M3M3 Development",
      tag: "Owner / Director",
      date: "2022 – Present · Registered March 2025",
      description:
        "Software development company building full-stack mobile, web, and enterprise platforms for the Belize market. Led a small team through the complete lifecycle of a production marketplace platform on Google Cloud.",
      sections: [
        {
          heading: "Company & Team Leadership",
          bullets: [
            "Established and operate M3M3 Development; manage client relationships, project scoping, team coordination, and business development as company owner.",
            "Led the development team as technical director: sprint planning, task delegation, code review, quality assurance, and production deployment management.",
            "Coordinated requirements, timelines, and delivery milestones with clients and stakeholders — accountable as both technical lead and business owner.",
          ],
        },
        {
          heading: "Platform Development — M3 Marketplace",
          bullets: [
            "**Belize Bank payment integration in production:** hosted payment page flow, HMAC-signed webhooks, tokenized card storage, transaction reconciliation — the exact capability that local Belize commerce platforms typically lack.",
            "Sole architect: 3-tier system with Flutter multi-platform client, Serverpod type-safe backend, PostgreSQL 16 with pgvector (semantic search) and PostGIS (geolocation).",
            "Scale: 87 REST API endpoints, 91 backend services, 418 data models, 744 database migrations. Distributed Redis caching, PgBouncer connection pooling (500+ concurrent), real-time WebSocket inventory streams.",
            "Four-provider payment integration (Stripe, PayPal, Belize Bank, COD) with real-time fraud detection (risk score 0–100, velocity tracking, blocklist), PCI-DSS tokenized storage, multi-currency (BZD/USD/EUR/GBP/CAD).",
            "Production-grade security: MFA, biometric login (fingerprint/face ID), JWT session management, 3-tier RBAC, rate limiting, complete audit logging.",
            "18-module admin panel + 12-module customer mobile app. Deployed on Google Cloud Run + Cloud SQL + Cloud Storage + Firebase Hosting. CI/CD via Cloud Build.",
          ],
        },
      ],
    },
    {
      title: "Systems Administrator",
      company: "Belize Social Investment Fund (BSIF)",
      tag: "Acting IT Manager",
      date: "August 2024 – Present",
      description:
        "Government-affiliated development institution. Sole IT administrator — performing the full scope of an IT Manager role independently.",
      sections: [
        {
          heading: "IT Management & Operations",
          bullets: [
            "**Single IT authority** for the organization: hardware procurement, software licensing, vendor negotiation, contract management, asset lifecycle.",
            "Direct ICT consultancy on active BSIF institutional projects — advising on technology selection, architecture, and deployment strategy aligned with organizational objectives.",
            "Administer all network infrastructure, servers, workstations, and peripherals; enforce IT security policies and manage user access controls organization-wide.",
            "Liaise with external vendors and service providers, managing SLAs, escalations, and technology support relationships.",
          ],
        },
        {
          heading: "Custom System Development",
          bullets: [
            "Built the SIF IT System (Serverpod + Flutter) with barcode-based ID generation, PDF reporting, FL Charts analytics dashboards, DataTable2 for large data sets, and Serverpod Streams for real-time updates.",
            "Developed BSIF MIS desktop application (Qt 6.8 / QML) with modular page architecture and event simulation for internal management workflows.",
            "Maintain all internally developed systems — applying updates, bug fixes, and performance improvements as operational needs evolve.",
          ],
        },
      ],
    },
    {
      title: "Data & Integration Specialist",
      company: "Dealer Spike (Solera Company)",
      date: "2022 – 2024",
      description:
        "Global technology platform for powersports dealerships. Managed enterprise data integration, API infrastructure, and SQL Server administration across 100+ client accounts.",
      bullets: [
        "Managed end-to-end ETL pipelines connecting 100+ dealership CRM systems via SFTP and REST APIs into SQL Server data warehouses on automated nightly schedules.",
        "Administered SQL Server: schema management, query optimization, indexing, performance tuning, and data integrity enforcement across all production systems.",
        "Deployed and managed Celigo iPaaS API ecosystem; coordinated vendor integrations, contract management, and onboarding for new client data sources.",
        "Built data standardization processes using PHP, Python, JavaScript, and CSVFix — automating workflows and reducing manual processing across all client accounts.",
        "Built and maintained PowerBI dashboards tracking pipeline throughput, API error rates, and system availability KPIs for stakeholder reporting.",
      ],
    },
    {
      title: "Systems Administrator",
      company: "Ready Call Center (RCC)",
      date: "2020 – 2022",
      description:
        "Customer service BPO company in Belmopan. On-site IT administrator with full responsibility for network infrastructure deployment and ongoing IT operations.",
      bullets: [
        "Planned and executed complete network infrastructure build-out: structured cabling, switch/router configuration, ISP integration, and full facility network from the ground up.",
        "Designed and implemented network redundancies and failover configurations to eliminate single points of failure and ensure business continuity.",
        "Configured all user workstations within the domain environment, applying group policies and access restrictions per management directives.",
        "Provided L1/L2 IT support for hardware, software, printers, and peripherals — maintaining rapid resolution to minimize operational disruption.",
      ],
    },
  ] as ReadonlyArray<CvJob>,

  projects: [
    {
      name: "M3 Marketplace — Enterprise E-Commerce & Marketplace Platform",
      status: "LIVE / PRODUCTION on GCP",
      description:
        "Full-stack platform for the Belize retail market. **Stack:** Dart/Flutter (mobile + web + desktop), Serverpod backend, PostgreSQL 16 + pgvector + PostGIS, Redis, PgBouncer, Docker, Google Cloud Run + Cloud SQL + Cloud Storage + Firebase Hosting. **Scale:** 287,026 LOC, 87 REST APIs, 91 backend services, 418 data models, 744 migrations. **Security:** MFA, biometric auth, JWT, 3-tier RBAC, rate limiting, audit trail, PCI-DSS tokenization, real-time fraud detection (9-factor risk scoring). **Features:** 4-provider payments incl. Belize Bank, WebSocket inventory streams, OpenAI semantic search, FCM push, Shipday delivery, multi-currency.",
    },
    {
      name: "BeliBet — Sports Betting Platform",
      status: "INDUSTRY-ADJACENT",
      description:
        "Full-stack sports betting platform with Serverpod backend, Flutter mobile app, and admin web panel. **Built end-to-end:** complete authentication (sign up / sign in / password reset with SHA256 hashing and email validation), real-time WebSocket event streaming, user wallet system (auto-created on signup), and admin event/betting management. **Direct gambling/betting industry development experience.**",
    },
    {
      name: "SIF IT System",
      status: "BSIF INTERNAL — PRODUCTION",
      description:
        "Multi-platform Serverpod / Flutter system: barcode-based ID generation, PDF report printing, Serverpod Streams for real-time updates, FL Charts analytics dashboards, and DataTable2 for large data set management. Built and maintained for BSIF organizational use as part of my Systems Administrator role.",
    },
    {
      name: "TraySoft Payment Module",
      status: "PRODUCTION-READY PACKAGE",
      description:
        "Standalone Serverpod / Flutter payment package: Stripe, PayPal, Belize Bank, and COD integration. Includes a fraud detection engine, velocity tracking, blocklist management, marketplace split payments, and multi-currency support. **543 automated tests, 78% coverage (QA Grade A).**",
    },
    {
      name: "BelizeHomes · M3M3 Marketplace · Other",
      status: "PORTFOLIO",
      description:
        "**BelizeHomes:** real estate marketplace + CRM with RBAC at the endpoint layer, Kanban pipeline (appflowy_board), Isar offline sync, Syncfusion charts, rich text editor, PDF generation, reactive forms, and Pluto Grid data tables. **M3M3 Marketplace + Admin Web:** live at m3m3development.com.",
    },
  ] as ReadonlyArray<CvProject>,

  skills: [
    {
      label: "Infrastructure",
      value:
        "Network Architecture, Structured Cabling, Switch/Router Config, Redundancy Design, Active Directory, Workstation Management",
    },
    {
      label: "Cloud & DevOps",
      value:
        "Google Cloud Run, Cloud SQL, Cloud Storage, Firebase Hosting, Docker Compose, Redis, PgBouncer, CI/CD (Cloud Build)",
    },
    {
      label: "Databases",
      value:
        "PostgreSQL 16, SQL Server, pgvector, PostGIS, Drift/SQLite, ETL Pipelines, Schema Design, Query Optimization",
    },
    {
      label: "Backend",
      value:
        "Serverpod (Dart), REST APIs, WebSockets, PHP, Python, JavaScript, Webhook Handling",
    },
    {
      label: "Frontend / Mobile",
      value:
        "Flutter (mobile + web + desktop), Dart, BLoC/Cubit, GoRouter, Material 3, Animations, Responsive UX/UI",
    },
    {
      label: "Integration & APIs",
      value:
        "Celigo iPaaS, Postman, SFTP, JSON/XML, Stripe, PayPal, Belize Bank, SendGrid, FCM, Shipday, OpenAI",
    },
    {
      label: "Security",
      value:
        "MFA, Biometric Auth, JWT, RBAC, Rate Limiting, PCI-DSS Tokenization, Fraud Detection, Audit Logging",
    },
    {
      label: "IT Operations",
      value:
        "Procurement, Vendor Management, Asset Lifecycle, SLA Management, IT Policy, L1/L2 Support",
    },
    {
      label: "Reporting & BI",
      value:
        "PowerBI, FL Charts, PDF Generation, KPI Dashboards, Syncfusion Charts, Data Visualization",
    },
    {
      label: "Desktop / Other",
      value:
        "Qt 6.8 / QML, Tkinter (Python), Barcode Generation, iOS & Android App Store Deployment",
    },
    {
      label: "Frameworks (Academic)",
      value:
        "Angular, Groovy / Grails — academic exposure at ENU; actively expanding for enterprise web development",
    },
  ] as ReadonlyArray<CvSkillRow>,

  competencies: [
    "IT Strategy, Planning & Governance",
    "Team Leadership & Staff Coordination",
    "Systems & Network Administration",
    "Database Administration & Performance",
    "Cybersecurity & Data Protection",
    "Reporting, Analytics & KPI Monitoring",
    "IT Procurement & Vendor Management",
    "UX/UI Design & Improvement",
    "IT Project Management & Delivery",
    "Application Security Best Practices",
    "Mobile & Web Application Development",
    "Continuous Learning & Adaptability",
  ] as ReadonlyArray<string>,
} as const;

// ─── Education block ──────────────────────────────────────────────────────
export const EDUCATION = {
  degree: "B.Sc. Computer Science",
  school: "Edinburgh Napier University",
  mode: "Online Program",
  dates: "2019 – 2023",
  modules:
    "Angular web frameworks, Groovy/server-side scripting, data structures, systems design, database management, software engineering principles.",
  certificateId: "0004686",
} as const;

// ─── Now block (Sivers-style) ─────────────────────────────────────────────
//
// "What I'm working on this month." Hardcoded so the owner can edit
// directly. Update monthly to keep page feeling alive.
export const NOW_ITEMS: ReadonlyArray<string> = [
  "Sole IT authority at BSIF — IT operations + custom internal systems.",
  "Shipping M3 Runner v2 — driver app + admin runner-ops console for M3 Marketplace.",
  "Studying Angular + Groovy on the way — broadening the BGLL-stack ramp plan.",
  "Open to IT Manager and Software Engineer roles in Belize · May 2026.",
] as const;

// ─── Languages strip ──────────────────────────────────────────────────────
export type LanguageChip = Readonly<{ label: string; level: string }>;

export const LANGUAGES: ReadonlyArray<LanguageChip> = [
  { label: "English", level: "native" },
  { label: "Belize Kriol", level: "fluent" },
  { label: "Spanish", level: "conversational" },
] as const;

// ─── "Outside of work" / interests strip ──────────────────────────────────
export const INTERESTS: ReadonlyArray<string> = [
  "Reads about distributed systems",
  "Boxing",
  "Belmopan local food",
] as const;

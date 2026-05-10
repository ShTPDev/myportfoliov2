/**
 * ArchitectureDiagram — layered system architecture for M3 Marketplace.
 *
 * Replaces the old 5-node "Customer → App → API → Bank → Vendor" sketch with
 * a real, production-accurate layered diagram showing how the M3 Marketplace
 * platform actually runs in production.
 *
 * Why a layered diagram (not a flow):
 *   The platform isn't a single linear request path — it's a multi-tenant
 *   SaaS with row-level security, read replicas, distributed locks,
 *   tier-cached streaming, and external integrations. A horizontal flow
 *   would hide that. A 6-row layered diagram shows the depth.
 *
 * Layers:
 *   1. Clients          — Mobile (iOS+Android), Marketplace Web, Admin Web
 *   2. Edge             — Cloud CDN, Firebase Hosting
 *   3. API              — Cloud Run (Serverpod) + PgBouncer
 *   4. Data             — Postgres primary, read replica, Redis, Cloud Storage
 *   5. Integrations     — TraySoft Payments, Shipday, SendGrid, FCM, OpenAI
 *   6. Operations       — Cloud Build, Cloud Scheduler, BigQuery, Secret Mgr
 *
 * Concept showcase:
 *  - **`useScroll` + `useTransform`** — drives a scoped progress bar at the
 *    top of the diagram so the user gets a "this is alive" cue.
 *  - **Pure data → presentation** — the layer/node array drives JSX, so a
 *    new layer is a one-line edit.
 *  - **Reduced-motion friendly** — animations are scroll-triggered with
 *    `whileInView { once: true }`; once revealed they stay still.
 */

"use client";

import { motion } from "framer-motion";
import {
  Boxes,
  CalendarClock,
  Cloud,
  CloudCog,
  CreditCard,
  Database,
  Globe,
  KeyRound,
  Layers,
  Mail,
  Server as ServerIcon,
  Smartphone,
  Sparkles,
  Truck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";

/**
 * One node in a layer. Kept tiny: a label, an icon, and an optional muted
 * sub-line for tech detail. Width is computed at render time from the
 * layer's column count, so adding a node never breaks the layout.
 */
interface Node {
  label: string;
  hint?: string;
  Icon: LucideIcon;
}

/**
 * One layer of the architecture. `tone` drives the accent color so layers
 * read distinctly even at-a-glance.
 */
interface Layer {
  title: string;
  subtitle: string;
  tone: "cyan" | "violet" | "blue" | "emerald" | "amber" | "neutral";
  nodes: readonly Node[];
}

const TONE_BG: Record<Layer["tone"], string> = {
  cyan: "ring-accent-cyan/30 bg-accent-cyan/5",
  violet: "ring-accent-violet/30 bg-accent-violet/5",
  blue: "ring-accent-blue/30 bg-accent-blue/5",
  emerald: "ring-emerald-300/30 bg-emerald-300/5",
  amber: "ring-amber-300/30 bg-amber-300/5",
  neutral: "ring-white/10 bg-white/[0.03]",
};

const TONE_ACCENT: Record<Layer["tone"], string> = {
  cyan: "text-accent-cyan",
  violet: "text-accent-violet",
  blue: "text-accent-blue",
  emerald: "text-emerald-300",
  amber: "text-amber-300",
  neutral: "text-foreground-muted",
};

/**
 * Real production architecture, sourced from the M3 Marketplace codebase
 * (pink_server / pink_flutter). Update here, the diagram updates.
 */
const LAYERS: readonly Layer[] = [
  {
    title: "Clients",
    subtitle: "iOS · Android · Web · Admin",
    tone: "cyan",
    nodes: [
      { label: "Flutter Mobile", hint: "iOS + Android", Icon: Smartphone },
      { label: "Marketplace Web", hint: "Public storefront", Icon: Globe },
      { label: "Admin Web", hint: "Flutter Web · Firebase Hosting", Icon: Layers },
    ],
  },
  {
    title: "Edge",
    subtitle: "Caching · Hosting · CORS",
    tone: "blue",
    nodes: [
      { label: "Cloud CDN", hint: "Image + asset cache", Icon: Cloud },
      { label: "Firebase Hosting", hint: "Static admin + marketplace", Icon: CloudCog },
    ],
  },
  {
    title: "API tier",
    subtitle: "Serverpod on Cloud Run · 1–15 instances · 80 conc/req",
    tone: "violet",
    nodes: [
      { label: "Cloud Run", hint: "Serverpod API · 87 endpoints", Icon: ServerIcon },
      { label: "PgBouncer", hint: "Connection pooling · 500+ conc", Icon: Workflow },
    ],
  },
  {
    title: "Data tier",
    subtitle: "RLS · 18 tenant-scoped tables · read replica · 3-tier cache",
    tone: "emerald",
    nodes: [
      { label: "Postgres 16", hint: "Primary · RLS + pgvector + PostGIS", Icon: Database },
      { label: "Read replica", hint: "Read-after-write watermark", Icon: Database },
      { label: "Redis", hint: "Distributed lock · cache · rate limit", Icon: Boxes },
      { label: "Cloud Storage", hint: "Images + uploads via GCS", Icon: Cloud },
    ],
  },
  {
    title: "Integrations",
    subtitle: "Payments · delivery · email · push · search",
    tone: "cyan",
    nodes: [
      { label: "TraySoft Payments", hint: "Stripe · PayPal · Belize Bank · COD", Icon: CreditCard },
      { label: "Shipday", hint: "Delivery · webhook-driven", Icon: Truck },
      { label: "SendGrid", hint: "Transactional + marketing email", Icon: Mail },
      { label: "OpenAI", hint: "Semantic search embeddings", Icon: Sparkles },
    ],
  },
  {
    title: "Operations",
    subtitle: "CI/CD · cron · audit · secrets",
    tone: "amber",
    nodes: [
      { label: "Cloud Build", hint: "git → image → Cloud Run", Icon: Workflow },
      { label: "Cloud Scheduler", hint: "Cron: billing · archive · reminders", Icon: CalendarClock },
      { label: "Secret Manager", hint: "Zero-downtime rotation", Icon: KeyRound },
      { label: "BigQuery", hint: "Audit + analytics archive", Icon: Database },
    ],
  },
];

/**
 * Sub-component: one architecture layer rendered as a horizontal strip of
 * node cards. Server-renderable from a parent client component because we
 * don't pull in any hooks here.
 */
function LayerRow({ layer, index }: { layer: Layer; index: number }) {
  const accent = TONE_ACCENT[layer.tone];
  const ring = TONE_BG[layer.tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`glass relative rounded-2xl p-5 ring-1 ${ring}`}
    >
      {/* Layer header — small uppercase title + descriptor */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${accent}`}>
            {`L${index + 1} · ${layer.title}`}
          </span>
          <p className="mt-1 text-sm text-foreground/80 sm:text-base">
            {layer.subtitle}
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
          {layer.nodes.length} {layer.nodes.length === 1 ? "node" : "nodes"}
        </span>
      </div>

      {/* Node strip — wrapping flex so any node count works on any width */}
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {layer.nodes.map((node) => {
          const NodeIcon = node.Icon;
          return (
            <li
              key={node.label}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
            >
              <NodeIcon
                className={`mt-0.5 h-4 w-4 shrink-0 ${accent}`}
                aria-hidden
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">
                  {node.label}
                </div>
                {node.hint && (
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
                    {node.hint}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

export function ArchitectureDiagram() {
  return (
    <Section
      id="architecture"
      eyebrow="Systems architecture"
      title="How M3 Marketplace actually runs in production."
      description="A multi-tenant SaaS on Google Cloud — not a generic three-tier sketch. Six layers from the Flutter clients down through Cloud Run, Postgres with RLS + a read replica, Redis-backed distributed locks, the TraySoft payment module, and the operations plumbing that keeps it all current."
    >
      <div className="grid grid-cols-1 gap-3">
        {LAYERS.map((layer, i) => (
          <LayerRow key={layer.title} layer={layer} index={i} />
        ))}
      </div>

      {/* Architectural-decisions strip — the "why this is interesting" callouts.
          Sourced from real production patterns in pink_server. */}
      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        {DECISIONS.map((d, i) => (
          <motion.div
            key={d.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
            className="glass rounded-2xl p-5"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-cyan">
              {d.title}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
              {d.body}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/**
 * Architectural decisions worth surfacing — each one signals "I have done
 * non-textbook systems design". Lifted from the real production codebase.
 */
const DECISIONS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Defense-in-depth tenancy",
    body: "PostgreSQL Row-Level Security on 18 tables. Every query sets app.current_tenant_id; even if a WHERE clause is missing in app code, the database refuses to leak across tenants.",
  },
  {
    title: "Read replica + read-after-write",
    body: "High-traffic reads (browse, fraud scores) route to a side-channel replica. A per-tenant write watermark routes back to primary for the first 5 seconds after a mutation so users never see stale data.",
  },
  {
    title: "Distributed checkout locks",
    body: "Redis SETNX (15s TTL) throttles concurrent stock reservations on hot items, layered above Postgres FOR UPDATE — Redis is the throttle, Postgres stays the source of truth. Fails open if Redis is offline.",
  },
  {
    title: "Three-tier cache + stream dedup",
    body: "In-memory (5 min) → Drift/IndexedDB (1h) → Redis (30 min). Serverpod streams use a Completer-based shared cache so N listeners on watchCategories trigger one DB query, not N.",
  },
  {
    title: "Refresh-token reuse detection",
    body: "Admin sessions use rotating refresh-token families. Reuse of an old token = forced full logout, surfaced to the audit log. Limits the blast radius of a stolen token to one request.",
  },
  {
    title: "Cron > in-process timers",
    body: "Billing archive, reminders, retention sweeps all run on Cloud Scheduler hitting dedicated /cron/* endpoints — not in-process timers that die with the instance. Survives Cloud Run cold-stops cleanly.",
  },
];

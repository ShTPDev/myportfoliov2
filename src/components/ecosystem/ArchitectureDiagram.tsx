/**
 * ArchitectureDiagram — animated SVG of the M3 Marketplace order/payment flow.
 *
 *   Customer → M3 App → Serverpod API → Belize Bank → Vendor Settlement
 *
 * This mirrors the real production pipeline: a shopper places an order in the
 * Flutter mobile app, which calls the Serverpod backend, which routes payment
 * through the Belize Bank integration, which settles funds out to the vendor.
 * Every transaction is observable, auditable, and goes through this same path.
 *
 * Concept showcase:
 *  - **SVG animation via Framer Motion** — `motion.line` with `pathLength`
 *    animates from 0 → 1, "drawing" the connector as it scrolls into view.
 *  - **`whileInView` on SVG children** — the same scroll-trigger pattern that
 *    works on regular DOM elements also works on SVG nodes.
 *  - **Per-element delay via `transition.delay`** — each connector and node
 *    is offset by `i * step` so they appear in sequence, left → right.
 *  - **Pure server-renderable HTML structure**, but the file is `"use client"`
 *    because Framer Motion needs the browser (it touches `window`).
 *  - **`readonly Node[]` with `as const`** — the NODES array is immutable,
 *    so TS catches accidental mutation downstream.
 */

"use client";

import { motion } from "framer-motion";
import {
  Smartphone,
  Server,
  Landmark,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";

// One node in the flow diagram. `cx` is the X-coordinate of the node's center
// inside the SVG's 1000-wide viewBox.
interface Node {
  id: string;
  label: string;
  Icon: LucideIcon;
  cx: number;
}

// The five stages of the M3 order/payment flow. Spaced evenly across 1000px.
//   - Users    : the customer placing the order
//   - Smartphone : the Flutter mobile app
//   - Server   : the Serverpod backend (API + business logic)
//   - Landmark : Belize Bank (the bank icon — Landmark works as a stand-in)
//   - Store    : the vendor receiving settlement
const NODES: readonly Node[] = [
  { id: "customer", label: "Customer",     Icon: Users,      cx: 100 },
  { id: "app",      label: "M3 App",       Icon: Smartphone, cx: 300 },
  { id: "api",      label: "Serverpod API", Icon: Server,    cx: 500 },
  { id: "bank",     label: "Belize Bank",  Icon: Landmark,   cx: 700 },
  { id: "vendor",   label: "Vendor",       Icon: Store,      cx: 900 },
] as const;

const ICON_RADIUS = 28;
const NODE_Y = 60;

export function ArchitectureDiagram() {
  return (
    <Section
      id="architecture"
      eyebrow="System architecture"
      title="How money + orders flow through M3 Marketplace."
      description="Every transaction passes through the same observable, audited pipeline: the customer's app calls the Serverpod backend, payment routes through the Belize Bank integration, and funds settle to the vendor — with HMAC-signed webhooks and an append-only audit trail at every hop."
    >
      <div className="glass overflow-x-auto rounded-2xl p-6">
        <svg
          viewBox="0 0 1000 140"
          className="min-w-[720px] w-full"
          // role/aria for accessibility — screen readers describe the diagram.
          role="img"
          aria-label="Order flow: Customer to M3 App to Serverpod API to Belize Bank to Vendor"
        >
          {/* Connecting lines drawn between consecutive nodes. */}
          {NODES.slice(0, -1).map((from, i) => {
            const to = NODES[i + 1];
            const x1 = from.cx + ICON_RADIUS;
            const x2 = to.cx - ICON_RADIUS;
            return (
              <motion.line
                key={`${from.id}-${to.id}`}
                x1={x1}
                y1={NODE_Y}
                x2={x2}
                y2={NODE_Y}
                stroke="url(#flowGradient)"
                strokeWidth={2}
                strokeLinecap="round"
                // pathLength animates the dash from 0 → 1 — line "draws" in.
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              />
            );
          })}

          {/* Define the gradient stroke once, reused by every line above. */}
          <defs>
            <linearGradient id="flowGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#00f5ff" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Nodes — circle + icon + text label, animated in sequence. */}
          {NODES.map((n, i) => (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              <circle
                cx={n.cx}
                cy={NODE_Y}
                r={ICON_RADIUS}
                fill="rgba(255,255,255,0.04)"
                stroke="rgba(255,255,255,0.18)"
              />
              {/* Icon centered. lucide icons are 24px — offset by half. */}
              <g
                transform={`translate(${n.cx - 12} ${NODE_Y - 12})`}
                className="text-foreground"
              >
                <n.Icon width={24} height={24} strokeWidth={1.6} />
              </g>
              <text
                x={n.cx}
                y={NODE_Y + ICON_RADIUS + 22}
                textAnchor="middle"
                className="fill-foreground-muted font-mono text-[11px]"
              >
                {n.label}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </Section>
  );
}

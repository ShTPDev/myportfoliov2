/**
 * ArchitectureDiagram — animated SVG showing the M3 data flow.
 *
 *   Customer → Marketplace → Payment Gateway → Business → Runner
 *
 * Concept showcase:
 *  - **SVG animation via Framer Motion** — `motion.path` with `pathLength`
 *    animates from 0 → 1, "drawing" the line as it scrolls into view.
 *  - **`whileInView` on SVG children** — same scroll-trigger pattern as
 *    regular elements.
 *  - **Per-element delay via `transition.delay`** — sequence the nodes.
 *  - **Pure server-renderable HTML structure**, but the file is `"use client"`
 *    because Framer Motion needs the browser.
 */

"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  ShoppingBag,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";

interface Node {
  id: string;
  label: string;
  Icon: LucideIcon;
  // Position in the 1000x140 viewBox (centers of nodes).
  cx: number;
}

const NODES: readonly Node[] = [
  { id: "customer",    label: "Customer",     Icon: Users,       cx: 100 },
  { id: "marketplace", label: "Marketplace",  Icon: ShoppingBag, cx: 300 },
  { id: "payments",    label: "Payments",     Icon: CreditCard,  cx: 500 },
  { id: "business",    label: "Business",     Icon: Store,       cx: 700 },
  { id: "runner",      label: "Runner",       Icon: Truck,       cx: 900 },
];

const ICON_RADIUS = 28;
const NODE_Y = 60;

export function ArchitectureDiagram() {
  return (
    <Section
      id="architecture"
      eyebrow="System flow"
      title="How it all fits together."
      description="Every M3 product is one node in the same network. Money, orders, and deliveries move through a single, observable path."
    >
      <div className="glass overflow-x-auto rounded-2xl p-6">
        <svg
          viewBox="0 0 1000 140"
          className="min-w-[720px] w-full"
          // role/aria for accessibility — screen readers describe it.
          role="img"
          aria-label="Data flow: Customer to Marketplace to Payments to Business to Runner"
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
                // pathLength animates the dash from 0 to 1 — line "draws".
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              />
            );
          })}

          {/* Define gradient stroke once. */}
          <defs>
            <linearGradient id="flowGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#00f5ff" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Nodes */}
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
              {/* Icon centered. SVG icons from lucide are 24px; offset by half. */}
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

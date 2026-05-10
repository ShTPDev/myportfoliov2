/**
 * Terminal — fake terminal that types a sequence of commands + outputs.
 *
 * State machine: walks through a typed list of `Step`s. Each step is either
 * a command (uses CommandLine + typewriter) or pre-rendered output lines.
 *
 * Concept showcase:
 *  - **Tagged union for steps** — `{ kind: "cmd", ... } | { kind: "out", ... }`.
 *    Discriminated unions let TS narrow the type in each render branch.
 *  - **`useState<number>(0)` index** — drives which steps are visible.
 *  - **Side effects belong in useEffect** — never call `setTimeout` directly
 *    in render; effects are the right place for "after render, schedule X".
 *  - **Callback chaining** — CommandLine's `onDone` advances the index.
 */

"use client";

import { useEffect, useState } from "react";
import { CommandLine } from "./CommandLine";
import { TerminalOutput } from "./TerminalOutput";

type Step =
  | { kind: "cmd"; command: string }
  | { kind: "out"; lines: readonly string[] };

// Script content is IT-Manager flavored: an infra audit, a marketplace
// health check, and a security-posture review. Each `cmd` step animates
// (typewriter) and each `out` step renders a static block of result lines.
const SCRIPT: readonly Step[] = [
  { kind: "cmd", command: "audit infrastructure" },
  {
    kind: "out",
    lines: [
      "✔ AD: 47 users · 12 service accounts",
      "✔ Network: redundant ISP · 99.97% uptime (90d)",
      "✔ Endpoints: 38/38 patched · 0 critical CVEs",
    ],
  },
  { kind: "cmd", command: "show m3-marketplace" },
  {
    kind: "out",
    lines: [
      "→ Cloud Run · 3 instances · healthy",
      "→ Cloud SQL (PostgreSQL 16) · primary + 1 replica",
      "→ Belize Bank gateway · 142 tx today · 0 failed",
    ],
  },
  { kind: "cmd", command: "review security-posture" },
  {
    kind: "out",
    lines: [
      "- MFA: enforced org-wide",
      "- Biometric login: enabled (mobile)",
      "- PCI-DSS tokenization: active",
      "- Audit log: 30-day retention · streaming to BQ",
    ],
  },
] as const;

export function Terminal() {
  // Visible step count; commands auto-advance via onDone, outputs via timer.
  const [visible, setVisible] = useState(1);

  const advance = () => setVisible((v) => Math.min(v + 1, SCRIPT.length));

  // After an OUTPUT step renders as the latest visible, wait briefly then
  // reveal the next step (typically the next command).
  useEffect(() => {
    const current = SCRIPT[visible - 1];
    if (!current || current.kind !== "out") return;
    if (visible >= SCRIPT.length) return;
    const id = setTimeout(advance, 700);
    return () => clearTimeout(id); // cleanup on re-run / unmount
  }, [visible]);

  return (
    <div className="glass overflow-hidden rounded-2xl">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <span className="ml-3 font-mono text-[11px] text-foreground-muted">
          m3@portfolio:~ — bash
        </span>
      </div>

      <div className="space-y-3 p-5">
        {SCRIPT.slice(0, visible).map((step, i) => {
          // TS narrows `step` here based on `kind`. No type assertions needed.
          if (step.kind === "cmd") {
            const isCurrent = i === visible - 1;
            return (
              <CommandLine
                key={i}
                command={step.command}
                onDone={isCurrent ? advance : undefined}
              />
            );
          }
          return <TerminalOutput key={i} lines={step.lines} />;
        })}
      </div>
    </div>
  );
}

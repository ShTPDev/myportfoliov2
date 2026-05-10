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

const SCRIPT: readonly Step[] = [
  { kind: "cmd", command: "load marketplace" },
  {
    kind: "out",
    lines: [
      "✔ pulled latest catalog (2.4k SKUs)",
      "✔ connected to payment gateway",
      "✔ runner pool: 18 online",
    ],
  },
  { kind: "cmd", command: "show infrastructure" },
  {
    kind: "out",
    lines: [
      "→ Serverpod cluster · 3 nodes · healthy",
      "→ Postgres primary + 1 replica · lag 12ms",
      "→ WireGuard mesh · 7 peers · all up",
    ],
  },
  { kind: "cmd", command: "list technologies" },
  {
    kind: "out",
    lines: [
      "Flutter · Serverpod · Dart · Postgres",
      "Docker · WireGuard · Linux · Nginx",
      "Next.js · TypeScript · Tailwind · Framer Motion",
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

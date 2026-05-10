/**
 * TerminalSection — wraps the lazy-loaded Terminal in a Section.
 *
 * Phase 6 perf: dynamic-import the Terminal so its JS only ships when this
 * section actually mounts. Smaller initial bundle.
 */

"use client";

import dynamic from "next/dynamic";
import { Section } from "@/components/ui/Section";

const Terminal = dynamic(
  () => import("./Terminal").then((m) => m.Terminal),
  {
    ssr: false,
    loading: () => (
      <div className="glass h-40 rounded-2xl p-5">
        <span className="font-mono text-xs text-foreground-muted">
          loading terminal…
        </span>
      </div>
    ),
  },
);

export function TerminalSection() {
  return (
    <Section
      id="terminal"
      eyebrow="CLI"
      title="Operate the platform from a single line."
      description="The same tools I use to inspect production systems — wrapped in a tiny demo."
    >
      <Terminal />
    </Section>
  );
}

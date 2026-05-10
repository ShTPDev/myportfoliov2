/**
 * CommandLine — single line: prompt + typed command, calls `onDone` when finished.
 *
 * Concept showcase:
 *  - **Callback prop** — parent passes `onDone` so the parent can advance to
 *    the next command in a sequence.
 *  - **Effect dependency on `done`** — fires `onDone` exactly when typing
 *    completes (not on every render).
 */

"use client";

import { useEffect } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";

export function CommandLine({
  command,
  prompt = "›",
  onDone,
}: {
  command: string;
  prompt?: string;
  onDone?: () => void;
}) {
  const { displayed, done } = useTypewriter(command, 28);

  // Notify parent the moment typing finishes.
  useEffect(() => {
    if (done) onDone?.();
  }, [done, onDone]);

  return (
    <div className="flex items-baseline gap-2 font-mono text-sm">
      <span className="text-accent-cyan">{prompt}</span>
      <span className="text-foreground">{displayed}</span>
      {/* Blinking caret while typing in progress */}
      {!done && (
        <span className="inline-block h-4 w-[7px] animate-pulse bg-accent-cyan/80" />
      )}
    </div>
  );
}

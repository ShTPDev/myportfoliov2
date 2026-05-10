/**
 * TerminalOutput — single block of terminal text (lines after a command).
 *
 * Pure presentational. Lines fade in via Framer Motion stagger.
 */

"use client";

import { motion } from "framer-motion";

export function TerminalOutput({ lines }: { lines: readonly string[] }) {
  return (
    <div className="space-y-0.5 pl-4">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: i * 0.04 }}
          className="font-mono text-xs text-foreground-muted"
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * InterestsStrip — tiny "outside of work" chip-row.
 *
 * Humanizes the page. Hiring panels often cite cultural fit signals as
 * tiebreakers, and a short list of off-the-clock interests gives them a
 * concrete starting point for a conversation.
 *
 * Server Component. Data: `INTERESTS` from `src/data/career.ts`.
 */

import { Heart } from "lucide-react";

import { INTERESTS } from "@/data/career";

export function InterestsStrip(): React.JSX.Element {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan">
          <Heart className="h-3.5 w-3.5" aria-hidden />
          Outside of work
        </div>

        <ul className="flex flex-wrap gap-2">
          {INTERESTS.map((item) => (
            <li
              key={item}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-foreground-muted"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

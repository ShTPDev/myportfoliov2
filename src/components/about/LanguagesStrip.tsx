/**
 * LanguagesStrip — small strip showing languages spoken + Belmopan TZ line.
 *
 * Belize is officially multilingual; surfacing that fact alongside a
 * timezone disclosure makes the page feel grounded in place and signals
 * to remote-friendly hiring panels that the timezone reality is upfront.
 *
 * Server Component. Data lives in `src/data/career.ts` (`LANGUAGES`).
 *
 * Concept showcase:
 *   - Component is intentionally tiny — the file's whole job is "render
 *     these chips + this one line". Splitting tiny presentational bits
 *     into their own files keeps the page-level component readable.
 */

import { Clock, Languages as LanguagesIcon } from "lucide-react";

import { LANGUAGES } from "@/data/career";

export function LanguagesStrip(): React.JSX.Element {
  return (
    <div className="glass rounded-2xl p-5">
      {/* Header row — icon + label + chips. Wraps gracefully on narrow widths. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan">
          <LanguagesIcon className="h-3.5 w-3.5" aria-hidden />
          Languages
        </div>

        {/*
          Each chip is a span; not interactive. `tracking-tight` because
          the chip text is short and gets weirdly wide otherwise.
        */}
        <ul className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <li
              key={l.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-foreground"
            >
              <span className="font-medium">{l.label}</span>
              <span className="text-foreground-muted">· {l.level}</span>
            </li>
          ))}
        </ul>
      </div>

      {/*
        Timezone disclosure line. Belize is on CST year-round (no DST) —
        worth surfacing because it's commonly mistaken for Central Time
        with DST and that matters for scheduling interviews.
      */}
      <div className="mt-4 flex items-center gap-2 text-xs text-foreground-muted">
        <Clock className="h-3.5 w-3.5 text-accent-cyan" aria-hidden />
        <span>Belmopan · CST (no DST) · responds within 24h</span>
      </div>
    </div>
  );
}

/**
 * NowBlock — Sivers-style "/now" card.
 *
 * What is a /now page? See https://sivers.org/now — short, dated answer to
 * "what are you focused on right now?". On a portfolio it's the highest
 * signal-to-noise way to show the page is alive and the owner is still
 * engaged. We embed the same idea inline as a glass card.
 *
 * Server Component — pure data → HTML. No state, no events.
 *
 * Concept showcase (for beginners):
 *   - Data lives in `src/data/career.ts` as `NOW_ITEMS` so the owner
 *     edits one constant instead of hunting JSX.
 *   - `<time dateTime>` semantically marks the "as of" date. Search
 *     engines + screen readers parse that attribute.
 */

import { Sparkles } from "lucide-react";

import { Reveal } from "@/components/animations/Reveal";
import { NOW_ITEMS } from "@/data/career";

export function NowBlock(): React.JSX.Element {
  // Static "as of" label — change manually each month. We could do
  //   `new Date().toLocaleString("en-US", { month: "long", year: "numeric" })`
  // but that would render at build time on a static page and could go
  // stale silently between deploys. A hardcoded string is honest.
  const asOf = "May 2026";

  return (
    <Reveal direction="up" amount={0.15}>
      <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        {/* Soft accent glow — same trick as the closing CTA card */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent-cyan/10 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent-cyan">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            /now
          </div>

          <h3 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            What I&apos;m working on this month.
          </h3>

          <p className="mt-1 text-xs text-foreground-muted">
            As of <time dateTime="2026-05">{asOf}</time>
          </p>

          {/*
            Bullet list of current focus items. `marker:text-accent-cyan`
            colors the native list bullet to match the site palette without
            us building custom <span> markers.
          */}
          <ul className="mt-5 space-y-2.5 pl-5 marker:text-accent-cyan">
            {NOW_ITEMS.map((item) => (
              <li
                key={item}
                className="list-disc text-sm leading-relaxed text-foreground-muted sm:text-base"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

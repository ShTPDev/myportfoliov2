/**
 * StickyCaseStudy — Apple-style scroll-locked case study section.
 *
 * Per project we render a TALL section (`min-h-[200vh]`) split into two
 * columns on md+ screens:
 *
 *   ┌────────────────────────┬──────────────────────────────┐
 *   │ LEFT (sticky)          │ RIGHT (scrolls normally)     │
 *   │ icon + title +         │ description, stack pills,    │
 *   │ tagline + accent       │ metric tiles, status footer  │
 *   │ panel + progress bar   │                              │
 *   │                        │ (longer than left, so the    │
 *   │ stays pinned while     │  user keeps scrolling while  │
 *   │ user scrolls           │  the visual stays put)       │
 *   └────────────────────────┴──────────────────────────────┘
 *
 * When the section's bottom edge passes the viewport, native CSS sticky
 * "lets go" of the left panel and the next section's panel takes over —
 * giving the Apple/Stripe scroll-storytelling feel for free.
 *
 * ─────────────────────────────────────────────────────────────────────
 * Concept showcase (read top-to-bottom):
 *
 *  - **`"use client"`** — Framer Motion's `useScroll` reads `window` /
 *    `IntersectionObserver` / element bounding rects, all of which only exist
 *    in the browser. Without this directive Next.js would try to render this
 *    on the server and crash.
 *
 *  - **`useScroll({ target, offset })`** — by default `useScroll()` tracks
 *    PAGE scroll. Passing `target: ref` scopes the returned `scrollYProgress`
 *    motion value to that specific element's progress through the viewport.
 *      • `offset: ["start end", "end start"]`
 *           progress = 0 when the element's TOP touches the viewport's BOTTOM
 *           progress = 1 when the element's BOTTOM touches the viewport's TOP
 *      So as the user scrolls the section past the screen, progress runs
 *      from 0 → 1 across that whole journey. Perfect for a per-section
 *      progress bar.
 *
 *  - **`useTransform(input, inputRange, outputRange)`** — a piecewise mapping
 *    from one motion value to another. We map the `[0, 1]` progress range to
 *    `[0, 1]` for `scaleY`, but you can map to any range, including non-linear
 *    multi-stop ranges like `[0, 0.5, 1] → [0, 1, 0]` (pulse). Reactivity is
 *    automatic — when the input changes, the output recomputes without React
 *    re-renders (motion values bypass React's render cycle).
 *
 *  - **`position: sticky` + `top: 50%` + `-translate-y-1/2`** — sticky pins
 *    the element to a position relative to its NEAREST scroll container once
 *    a threshold is hit. With `top: 50%` plus a `-50%` Y translate we
 *    vertically center the panel in the viewport. The element only "lets go"
 *    when its parent (the case-study `<section>`) scrolls out of view.
 *
 *  - **Why `min-h-[200vh]`?** — `position: sticky` only has somewhere to stick
 *    if the parent is TALLER than the sticky child. A 200vh parent gives the
 *    user roughly one full viewport-height of scroll AFTER the section
 *    enters before the next one takes over. Less than that and the sticky
 *    effect is too short to feel deliberate.
 *
 *  - **Mobile fallback** — on small screens we DON'T want sticky behaviour:
 *    the visual would dominate every project's first viewport and the user
 *    would have to scroll past it twice. So we collapse to a single column
 *    with normal flow and a `min-h-auto`. Tailwind's `md:` prefix lets us
 *    apply sticky/grid-cols-2/min-height only at md+.
 *
 *  - **`useRef<HTMLElement | null>(null)`** — refs are React's escape hatch
 *    to a real DOM node. We hand the ref to a `<section>` and pass it into
 *    `useScroll({ target: ref })` so Framer Motion can measure that exact
 *    element. The `<HTMLElement | null>` generic types the `.current` value;
 *    it's null until React has mounted the element.
 *
 *  - **No `Math.random` / no sync `setState` in `useEffect`** — React 19
 *    strict purity rules. Motion values are the right tool for this job:
 *    they update without triggering re-renders.
 */

"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShoppingBag,
  Trophy,
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import type { EcosystemEntry, EcosystemKind } from "@/data/ecosystem";
import { Reveal } from "@/components/animations/Reveal";

/**
 * Why we re-import the icons here instead of using `entry.icon`:
 *
 * `entry.icon` is a React component (a function). The parent page is a
 * Server Component, and the React Server Components protocol can only send
 * SERIALIZABLE values across the server→client boundary (strings, numbers,
 * plain objects, arrays — NOT functions/components). Passing the whole
 * `entry` object would fail at build time with:
 *
 *   "Functions cannot be passed directly to Client Components..."
 *
 * Workaround: resolve the icon component on the CLIENT side by looking it
 * up via the entry's `kind` (which IS a serializable string). The data file
 * still owns "this kind uses ShoppingBag" — we just split the resolution
 * across the boundary.
 *
 * `Record<EcosystemKind, LucideIcon>` makes TS verify exhaustiveness: add
 * a new kind to the union and this map fails to compile until you wire it.
 */
const ICON_BY_KIND: Record<EcosystemKind, LucideIcon> = {
  marketplace: ShoppingBag,
  betting: Trophy,
  payments: CreditCard,
  internal: LayoutDashboard,
};

/**
 * Per-kind status copy. Same shape (and identical strings) as
 * `CaseStudyCard`'s `STATUS_BY_KIND`, kept local so the two components
 * remain independent — we don't want a refactor here to silently affect
 * the smaller card.
 *
 * `Record<EcosystemKind, T>` = "an object whose keys are exactly every
 * member of `EcosystemKind`". TS will refuse to compile if a kind is added
 * to the union without a corresponding entry here — exhaustiveness for free.
 */
const STATUS_BY_KIND: Record<
  EcosystemKind,
  { label: string; tone: string; footer: string }
> = {
  marketplace: {
    label: "Live · Production",
    tone: "text-emerald-300 ring-emerald-300/30 bg-emerald-300/10",
    footer: "Live production system on Google Cloud.",
  },
  betting: {
    label: "Production",
    tone: "text-accent-violet ring-accent-violet/30 bg-accent-violet/15",
    footer: "Full-stack production system — directly relevant to BGLL.",
  },
  payments: {
    label: "Production-ready package",
    tone: "text-accent-cyan ring-accent-cyan/30 bg-accent-cyan/15",
    footer: "Standalone package — 543 tests, 78% coverage, QA Grade A.",
  },
  internal: {
    label: "Internal · Production",
    tone: "text-accent-blue ring-accent-blue/30 bg-accent-blue/15",
    footer: "Internal production system at the Belize Social Investment Fund.",
  },
};

/**
 * Public props.
 *
 * We accept everything from `EcosystemEntry` EXCEPT `icon`. Why?
 *
 *   `Omit<T, K>` is a TS utility type that returns `T` minus the keys `K`.
 *   `EcosystemEntry` includes `icon: LucideIcon` (a function/component).
 *   Function values can't cross the server→client boundary in React Server
 *   Components, so we strip `icon` from the prop type and re-resolve it on
 *   the client via `ICON_BY_KIND[entry.kind]`. The page (a Server Component)
 *   can now pass entries with the icon implicitly omitted at the type level.
 *
 * Single-prop object pattern (`{ entry }`) is the canonical React shape. It
 * scales as we add more props later without breaking call sites.
 *
 * Explicit return type `React.JSX.Element` (instead of inferred) is
 * teaching-worthy: it documents the function as a JSX-rendering component.
 */
export type StickyCaseStudyEntry = Omit<EcosystemEntry, "icon">;

export function StickyCaseStudy({
  entry,
}: {
  entry: StickyCaseStudyEntry;
}): React.JSX.Element {
  // `Icon` is capitalized so JSX treats it as a component, not an HTML tag
  // (lowercase = HTML element). We resolve via the local `ICON_BY_KIND` map
  // (NOT `entry.icon`) because `entry` arrived from a Server Component and
  // function values can't cross that boundary — see the `ICON_BY_KIND`
  // top-of-file comment for the full reasoning.
  const Icon = ICON_BY_KIND[entry.kind];

  // Status lookup is fully typed thanks to the `Record<EcosystemKind, ...>`
  // above — no `any`, no optional chaining needed.
  const status = STATUS_BY_KIND[entry.kind];

  // Ref to the OUTER section. Framer Motion will measure this element's
  // position relative to the viewport every frame to compute progress.
  // `HTMLElement | null` because before mount `current` is null.
  const sectionRef = useRef<HTMLElement | null>(null);

  // Scoped scroll progress: NOT page progress, but progress of THIS section
  // through the viewport.
  //   offset[0] = "start end" → 0 when the section's TOP edge meets the
  //                              viewport's BOTTOM edge (i.e. the section is
  //                              just entering from below).
  //   offset[1] = "end start" → 1 when the section's BOTTOM edge meets the
  //                              viewport's TOP edge (i.e. the section is
  //                              just leaving off the top).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Map the linear [0, 1] progress to a vertical scale [0, 1] for the
  // progress bar. Identity in this case but `useTransform` is what wires the
  // motion value into a `style` we can apply. Note that it's reactive —
  // updates push to the DOM without React re-rendering the component.
  const progressScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      // ── Mobile (default): normal flow, auto height, single column.
      // ── md+ : grid with 2 columns, tall enough for sticky storytelling.
      //
      // `min-h-[200vh]` (md+ only) is the SCROLL ROOM. Without enough vertical
      // room, sticky has nothing to stick against — the panel would just sit
      // there and immediately release. 200vh = roughly one full extra screen
      // of scroll for the right column to advance under the pinned visual.
      className="relative md:grid md:min-h-[200vh] md:grid-cols-2 md:gap-12"
    >
      {/* ─────────────────────────── LEFT column: sticky visual ─────────────────────────── */}
      {/*
        On mobile this is a regular block. On md+ it's:
          - sticky        (pins to viewport once we've scrolled to it)
          - top-1/2       (pin point: 50% from the top)
          - -translate-y-1/2 (shift up by half its own height → centered)
          - h-fit         (shrink-wrap; sticky doesn't behave well on auto)
          - self-start    (don't let grid stretch it to row height)
      */}
      <div className="md:sticky md:top-1/2 md:h-fit md:-translate-y-1/2 md:self-start">
        {/*
          Glass panel — frosted blur + translucent background ring. The
          `accentClass` from the data adds the per-project tint (cyan for
          marketplace, violet for betting, etc.). `aspect-[4/5]` keeps the
          panel a consistent visual block across projects.
        */}
        <div
          className={`glass relative overflow-hidden rounded-3xl p-8 ring-1 ${entry.accentClass}`}
        >
          {/*
            Decorative gradient blob in the top-right corner. `pointer-events-
            none` so it never intercepts clicks. `blur-3xl` creates the soft
            "glow" feel. Pure decoration — `aria-hidden` keeps it out of
            assistive tech.
          */}
          <div
            aria-hidden
            className={`pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-40 blur-3xl ${entry.accentClass}`}
          />

          {/* ── Big icon ── */}
          {/*
            ~80px icon. `relative` so it sits ABOVE the absolute-positioned
            blob behind it. `inline-flex` + center utilities for the icon
            badge. The accentClass is reused here too for the inner ring.
          */}
          <div
            className={`relative inline-flex h-20 w-20 items-center justify-center rounded-2xl ring-1 ${entry.accentClass}`}
          >
            <Icon size={40} />
          </div>

          {/* ── Title + tagline ── */}
          <h3 className="relative mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {entry.title}
          </h3>
          <p className="relative mt-3 text-base text-foreground-muted sm:text-lg">
            {entry.tagline}
          </p>

          {/* ── Status pill ── */}
          <span
            className={`relative mt-6 inline-flex items-center rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider ring-1 ${status.tone}`}
          >
            {status.label}
          </span>

          {/*
            ── Vertical progress bar (md+ only) ──
            A 2px-wide track sitting on the left edge of the panel. The inner
            `<motion.div>` has `scaleY` driven by our `useTransform` motion
            value. `origin-top` so it grows DOWN from the top edge as the user
            scrolls — like a film progress bar.

            Hidden on mobile because there's no sticky behaviour there, and a
            progress bar wouldn't tell the user anything meaningful.
          */}
          <div
            aria-hidden
            className="absolute left-3 top-6 hidden h-[calc(100%-3rem)] w-[2px] overflow-hidden rounded-full bg-white/5 md:block"
          >
            <motion.div
              // `style.scaleY` is animated by the motion value. `origin-top`
              // makes the scaling fill from the top, not the middle.
              style={{ scaleY: progressScaleY }}
              className="h-full w-full origin-top bg-gradient-to-b from-accent-cyan via-accent-blue to-accent-violet"
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────── RIGHT column: scrolling content ─────────────────────────── */}
      {/*
        On mobile this just flows under the sticky-panel's mobile equivalent.
        On md+ it's the second grid column. Vertical padding gives the sticky
        panel breathing room at top/bottom of the section.
      */}
      <div className="mt-8 flex flex-col gap-8 md:mt-0 md:py-32">
        {/*
          Cascade reveal: each block slides+fades in as it enters the viewport.
          `Reveal` uses `whileInView` under the hood with `viewport={{ once:
          true }}` — the animation only plays once per element, not every time
          you scroll past.
        */}

        {/* ── Description paragraph ── */}
        <Reveal direction="up" amount={0.3}>
          <p className="text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
            {entry.description}
          </p>
        </Reveal>

        {/* ── Stack pills ── */}
        <Reveal direction="up" delay={0.1} amount={0.3}>
          <div>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
              Stack
            </div>
            <ul className="flex flex-wrap gap-2">
              {entry.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-foreground-muted"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* ── 3-column metric strip ── */}
        <Reveal direction="up" delay={0.2} amount={0.3}>
          <div>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
              Metrics
            </div>
            <div className="grid grid-cols-3 gap-3">
              {entry.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
                    {m.label}
                  </div>
                  <div className="mt-1.5 text-base font-semibold text-foreground sm:text-lg">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── Status footer ── */}
        <Reveal direction="up" delay={0.3} amount={0.3}>
          <div className="border-t border-white/10 pt-6">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
              Status
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-foreground-muted/80">
              {status.footer}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

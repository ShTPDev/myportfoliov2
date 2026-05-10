/**
 * StickyCaseStudy — Apple-style scroll-locked case study section.
 *
 * Per project we render a TALL section split into two columns on md+:
 *
 *   ┌────────────────────────┬──────────────────────────────┐
 *   │ LEFT (sticky)          │ RIGHT (scrolls normally)     │
 *   │ icon + title + status  │ description, outcomes,       │
 *   │ pill + tagline +       │ highlights, stack, metrics,  │
 *   │ surfaces + progress    │ gallery (if screenshots)     │
 *   └────────────────────────┴──────────────────────────────┘
 *
 * Concept showcase — read top-to-bottom for a tour:
 *  - **`"use client"`** — Framer Motion + `useState` need the browser.
 *  - **`useScroll({ target, offset })`** — scoped section progress, not page.
 *  - **`useTransform(input, inputRange, outputRange)`** — piecewise mapping.
 *  - **`position: sticky` inside flex** — the sticky element pins relative to
 *    its FLEX PARENT, so the section auto-sizes to the right column. No more
 *    guessing `min-h-[200vh]` and getting it wrong on big screens.
 *  - **`Record<EcosystemKind, LucideIcon>`** — exhaustiveness check at the
 *    server→client boundary, since icon components can't cross RSCs.
 *  - **`Record<ProjectStatus, ...>`** — same trick, this time for the status
 *    badge color/copy.
 *  - **`useState<boolean>` for highlights collapse** — local UI state, not
 *    derived from props. Resets per render of the parent only when `key`
 *    changes; otherwise the toggle survives re-renders.
 *  - **Conditional sections** — gallery/highlights/outcomes/groups render only
 *    when present.
 *
 * Why no `min-h-[200vh]` anymore?
 *  The previous version reserved 200vh on every section to give the sticky
 *  panel scroll room. That's wrong on two axes:
 *    • Big screens (1440p / 4K) with M3-style content can EXCEED 200vh, so
 *      the sticky panel un-sticks before the content finishes.
 *    • Short entries (Caribbean Bridges, Archived stubs) are way SHORTER than
 *      200vh, leaving a giant empty gap below.
 *  The fix: don't pin via `min-h` at all. Make the parent a flex row, mark
 *  the LEFT panel `md:sticky md:top-24 md:self-start`, and let the RIGHT
 *  column dictate the section's natural height. The sticky panel pins for
 *  exactly as long as the right column scrolls — no more, no less. CSS
 *  `position: sticky` was designed for this exact pattern.
 */

"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Apple,
  Building2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  LayoutDashboard,
  Monitor,
  MonitorCog,
  PackageOpen,
  Play,
  Server as ServerIcon,
  ShoppingBag,
  Smartphone,
  Trophy,
  Truck,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type {
  EcosystemEntry,
  EcosystemKind,
  ProjectLink,
  ProjectStatus,
  Surface,
} from "@/data/ecosystem";
import { Reveal } from "@/components/animations/Reveal";
import { GalleryLightbox } from "./GalleryLightbox";

/**
 * Map `kind` → icon component on the CLIENT side. The server-rendered page
 * can't pass function values across the RSC boundary, so we re-resolve here.
 *
 * `Record<EcosystemKind, LucideIcon>` makes TS verify exhaustiveness: add a
 * new kind to the union and this map fails to compile until you wire it.
 */
const ICON_BY_KIND: Record<EcosystemKind, LucideIcon> = {
  marketplace: ShoppingBag,
  payments: CreditCard,
  betting: Trophy,
  internal: LayoutDashboard,
  "real-estate": Building2,
  "marketing-site": Globe,
  desktop: MonitorCog,
  logistics: Truck,
};

/**
 * Map `status` → badge palette + footer caption.
 *
 * Copy was rewritten for a non-engineer audience:
 *  - "In active development" → "v1 shipped · v2 in progress" (more positive,
 *    signals there IS something live today, not just a future promise).
 *  - "Prototype" → "Early prototype" (clarifies maturity at a glance).
 *
 * Centralising here means a status rename is a one-spot edit.
 */
const STATUS_META: Record<
  ProjectStatus,
  { label: string; tone: string; footer: string }
> = {
  live: {
    label: "Live · Production",
    tone: "text-emerald-300 ring-emerald-300/30 bg-emerald-300/10",
    footer: "Live in production with real users.",
  },
  "internal-prod": {
    label: "Internal · Production",
    tone: "text-emerald-300 ring-emerald-300/30 bg-emerald-300/10",
    footer: "Internal production system at the institutional client.",
  },
  wip: {
    label: "v1 shipped · v2 in progress",
    tone: "text-amber-300 ring-amber-300/30 bg-amber-300/10",
    footer: "v1 in production — v2 actively under development.",
  },
  prototype: {
    label: "Early prototype",
    tone: "text-foreground-muted ring-white/15 bg-white/5",
    footer: "Early prototype — proof of concept, not deployed.",
  },
  archived: {
    label: "Archived",
    tone: "text-foreground-muted ring-white/10 bg-white/5",
    footer: "No longer maintained.",
  },
};

/**
 * Surface → icon + short label. Surfaces are the platforms a project ships
 * on (mobile, web, server, etc.). Rendering them as a chip-strip gives the
 * reader an at-a-glance "what does this project actually run on".
 */
const SURFACE_META: Record<Surface, { label: string; Icon: LucideIcon }> = {
  ios: { label: "iOS", Icon: Apple },
  android: { label: "Android", Icon: Smartphone },
  web: { label: "Web", Icon: Globe },
  "admin-web": { label: "Admin web", Icon: Monitor },
  desktop: { label: "Desktop", Icon: MonitorCog },
  server: { label: "Server", Icon: ServerIcon },
  "static-site": { label: "Static site", Icon: Globe },
  package: { label: "Package", Icon: PackageOpen },
};

/**
 * Outbound-link kind → icon. Every link gets the same chip treatment but
 * different glyph so the reader can scan repo / live / demo / docs at a
 * glance. Brand icons (Github, Linkedin) were dropped from lucide v1 for
 * trademark reasons — `ExternalLink` is the brand-neutral fallback.
 */
const LINK_ICON_BY_KIND: Record<ProjectLink["kind"], LucideIcon> = {
  live: Globe,
  repo: ExternalLink,
  demo: Play,
  "app-store": Smartphone,
  doc: FileText,
  external: ExternalLink,
};

/**
 * How many highlights to show before the "Show all" toggle appears. If a
 * project has ≤ this number, all render directly with no toggle.
 */
const HIGHLIGHT_COLLAPSE_THRESHOLD = 5;

/**
 * Public props.
 *
 * `Omit<T, K>` strips `icon` from `EcosystemEntry`. `icon` is a function
 * (a Lucide component) and React Server Components can't serialize functions
 * across the boundary — the client side re-resolves via ICON_BY_KIND.
 */
export type StickyCaseStudyEntry = Omit<EcosystemEntry, "icon">;

export function StickyCaseStudy({
  entry,
}: {
  entry: StickyCaseStudyEntry;
}): React.JSX.Element {
  // Capitalised local var so JSX accepts it as a component (lowercase tags
  // are HTML elements).
  const Icon = ICON_BY_KIND[entry.kind];
  const status = STATUS_META[entry.status];

  // Ref to the OUTER section so Framer Motion can scope scroll progress.
  const sectionRef = useRef<HTMLElement | null>(null);

  // Local UI state for the collapse toggle. `useState<boolean>` makes the
  // type explicit — the inferred type would be the same here, but spelling
  // it out is teaching-worthy: "this state is a boolean, nothing else".
  const [showAllHighlights, setShowAllHighlights] = useState<boolean>(false);

  // Lightbox state. -1 = closed; 0..N = open at that gallery index.
  // Lifted into THIS component so opening one doesn't affect siblings.
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  // 0 = section's TOP entered viewport's BOTTOM
  // 1 = section's BOTTOM left viewport's TOP
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Identity mapping is fine here — `useTransform` is what wires the
  // motion value into a `style` prop without React re-renders.
  const progressScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const hasHighlights = !!entry.highlights && entry.highlights.length > 0;
  const hasGallery = !!entry.gallery && entry.gallery.length > 0;
  const hasLinks = !!entry.links && entry.links.length > 0;
  const hasOutcomes = !!entry.outcomes && entry.outcomes.length > 0;
  const hasStackGroups =
    !!entry.stackGroups && Object.keys(entry.stackGroups).length > 0;

  // Compute the visible slice of highlights up-front so JSX stays clean.
  // `entry.highlights!` — non-null assertion: we already gated on
  // `hasHighlights` above, so TS would otherwise complain about
  // `undefined | readonly string[]`. The assertion is safe here.
  const highlightsAll = hasHighlights ? entry.highlights! : [];
  const highlightsOver = highlightsAll.length > HIGHLIGHT_COLLAPSE_THRESHOLD;
  const highlightsVisible =
    highlightsOver && !showAllHighlights
      ? highlightsAll.slice(0, HIGHLIGHT_COLLAPSE_THRESHOLD)
      : highlightsAll;

  return (
    <section
      ref={sectionRef}
      // Anchor for the scroll-spy nav. Sections target by `slug`.
      id={entry.slug}
      // Layout strategy:
      //   Mobile: single column, normal flow.
      //   md+   : flex ROW, gap-12. NO `min-h` — the section's natural height
      //           equals the right column's height. The left panel uses
      //           `md:sticky md:top-24 md:self-start`, which pins it to 6rem
      //           below the top while the right column scrolls past.
      //
      // Why flex (not grid) for the md+ layout? `position: sticky` measures
      // its containing block; with grid+`min-h` the containing block was the
      // *forced* tall grid cell, which is what caused the over/under-shoot
      // bug on big screens. With flex+self-start the containing block IS
      // the right column's natural height — exactly the height we want the
      // sticky panel pinned for.
      //
      // `md:scroll-mt-28` = `scroll-margin-top: 7rem` so when the scroll-spy
      // nav clicks an anchor, the section lands BELOW the navbar + chip strip
      // instead of being hidden behind them.
      className="relative scroll-mt-28 md:flex md:gap-12"
    >
      {/* ── LEFT: sticky visual panel ────────────────────────────────────
          `md:w-[40%]` — fixed left ratio so titles don't reflow.
          `md:sticky md:top-24 md:self-start` — the sticky magic. `self-start`
          collapses the flex item to its natural height (otherwise flex would
          stretch it to the row height and `position: sticky` would have no
          scroll room). */}
      <div className="md:sticky md:top-24 md:h-fit md:w-[40%] md:shrink-0 md:self-start">
        <div
          className={`glass relative overflow-hidden rounded-3xl p-8 ring-1 ${entry.accentClass}`}
        >
          {/* Decorative blob */}
          <div
            aria-hidden
            className={`pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-40 blur-3xl ${entry.accentClass}`}
          />

          {/* Big icon */}
          <div
            className={`relative inline-flex h-20 w-20 items-center justify-center rounded-2xl ring-1 ${entry.accentClass}`}
          >
            <Icon size={40} />
          </div>

          {/* Title + status pill ON ONE ROW.
              Status moved up here (was previously below the tagline) so the
              reader sees production-vs-WIP at first glance, before reading
              the tagline. `flex-wrap` lets the pill drop to a new line on
              very narrow widths without overflowing. */}
          <div className="relative mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {entry.title}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider ring-1 ${status.tone}`}
            >
              {status.label}
            </span>
          </div>

          <p className="relative mt-3 text-base text-foreground-muted sm:text-lg">
            {entry.tagline}
          </p>

          {/* Surfaces strip */}
          {entry.surfaces.length > 0 && (
            <ul className="relative mt-5 flex flex-wrap gap-1.5">
              {entry.surfaces.map((s) => {
                const meta = SURFACE_META[s];
                const SurfaceIcon = meta.Icon;
                return (
                  <li
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground-muted"
                  >
                    <SurfaceIcon className="h-3 w-3" aria-hidden />
                    {meta.label}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Outbound links — live URL, repo, demo, etc. */}
          {hasLinks && (
            <ul className="relative mt-3 flex flex-wrap gap-2">
              {entry.links!.map((link) => {
                const LinkIcon = LINK_ICON_BY_KIND[link.kind];
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      // Live link gets brighter cyan tint to draw the eye —
                      // it's the most-conversion-relevant chip.
                      className={
                        link.kind === "live"
                          ? "inline-flex items-center gap-1.5 rounded-full bg-accent-cyan/20 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent-cyan ring-1 ring-accent-cyan/40 transition hover:bg-accent-cyan/30"
                          : "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground-muted transition hover:border-white/20 hover:text-foreground"
                      }
                    >
                      <LinkIcon className="h-3 w-3" aria-hidden />
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Vertical progress bar (md+) */}
          <div
            aria-hidden
            className="absolute left-3 top-6 hidden h-[calc(100%-3rem)] w-[2px] overflow-hidden rounded-full bg-white/5 md:block"
          >
            <motion.div
              style={{ scaleY: progressScaleY }}
              className="h-full w-full origin-top bg-gradient-to-b from-accent-cyan via-accent-blue to-accent-violet"
            />
          </div>
        </div>
      </div>

      {/* ── RIGHT: scrolling content ─────────────────────────────────────
          `md:flex-1` — claim the remaining width inside the flex row.
          `md:pb-16` — extra bottom padding so the sticky left panel doesn't
          un-stick awkwardly at the boundary between projects. */}
      <div className="mt-8 flex flex-col gap-6 md:mt-0 md:flex-1 md:pt-2 md:pb-16">
        {/* Description */}
        <Reveal direction="up" amount={0.3}>
          <p className="text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
            {entry.description}
          </p>
        </Reveal>

        {/* Outcomes — short non-engineer-friendly callouts. Renders ABOVE
            the heavier metrics grid so casual readers see the punchline
            first. 1–3 chips per project. */}
        {hasOutcomes && (
          <Reveal direction="up" delay={0.04} amount={0.3}>
            <div>
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
                Outcomes
              </div>
              <ul className="flex flex-wrap gap-2">
                {entry.outcomes!.map((o) => (
                  <li
                    key={o}
                    // Brighter ring + bigger text than other chips: this is
                    // the "elevator pitch" row, it should pop.
                    className="inline-flex items-center rounded-full bg-accent-cyan/10 px-3.5 py-1.5 text-xs font-medium text-accent-cyan ring-1 ring-accent-cyan/30"
                  >
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        {/* Highlights — only renders if the entry provided them.
            Collapse pattern: when there are more than the threshold (5),
            render the first 5 and a toggle. ≤5 → render all, no toggle. */}
        {hasHighlights && (
          <Reveal direction="up" delay={0.05} amount={0.3}>
            <div>
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
                Highlights
              </div>
              <ul className="space-y-2">
                {highlightsVisible.map((h) => (
                  <li
                    key={h}
                    className="flex gap-3 text-sm leading-relaxed text-foreground/90"
                  >
                    <span
                      aria-hidden
                      className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-accent-cyan"
                    />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Toggle button. Only renders when collapse is needed.
                  `aria-expanded` lets screen readers announce the state.
                  The chevron flips based on state for visual feedback. */}
              {highlightsOver && (
                <button
                  type="button"
                  onClick={() => setShowAllHighlights((v) => !v)}
                  aria-expanded={showAllHighlights}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground-muted transition hover:border-white/20 hover:text-foreground"
                >
                  {showAllHighlights ? (
                    <>
                      <ChevronUp className="h-3 w-3" aria-hidden />
                      Show fewer
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" aria-hidden />
                      Show all ({highlightsAll.length})
                    </>
                  )}
                </button>
              )}
            </div>
          </Reveal>
        )}

        {/* Stack — grouped if `stackGroups` is present, otherwise flat.
            We pick one path or the other; never both, to avoid duplicate
            chips. */}
        <Reveal direction="up" delay={0.1} amount={0.3}>
          <div>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
              Stack
            </div>
            {hasStackGroups ? (
              // Grouped mode: one labelled row per group. `Object.entries`
              // returns `[key, value]` tuples; we destructure them in the
              // `.map` callback. The key (group name) doubles as React's
              // list key since group names are unique per project.
              <div className="flex flex-col gap-3">
                {Object.entries(entry.stackGroups!).map(([group, items]) => (
                  <div key={group}>
                    <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground-muted/70">
                      {group}
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {items.map((tech) => (
                        <li
                          key={tech}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-foreground-muted"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
          </div>
        </Reveal>

        {/* Metric strip — flexible columns based on count (3 default) */}
        <Reveal direction="up" delay={0.2} amount={0.3}>
          <div>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
              Metrics
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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

        {/* Gallery — clickable thumbnails that open the GalleryLightbox.
            Each tile uses `object-contain` against a black backdrop so
            portrait videos / odd-aspect images letterbox cleanly instead
            of cropping. Click any tile → modal viewer with arrow-key
            navigation, fullscreen button (videos), and Escape-to-close. */}
        {hasGallery && (
          <Reveal direction="up" delay={0.25} amount={0.2}>
            <div>
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
                Gallery
                <span className="ml-2 text-foreground-muted/60 normal-case tracking-normal">
                  click to expand
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {entry.gallery!.map((item, i) => (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    aria-label={
                      item.kind === "image"
                        ? `Open image: ${item.caption ?? item.alt}`
                        : `Open video: ${item.caption ?? "video"}`
                    }
                    className="group glass overflow-hidden rounded-xl text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
                  >
                    {/* Black backdrop + object-contain so portrait media
                        letterboxes instead of cropping. Aspect-[16/10] keeps
                        the grid uniform regardless of source dimensions. */}
                    <div className="relative aspect-[16/10] w-full bg-black/40">
                      {item.kind === "image" ? (
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          sizes="(min-width: 640px) 50vw, 100vw"
                          className="object-contain"
                        />
                      ) : (
                        <>
                          {/* `muted` + `autoPlay` + `playsInline` = silent
                              autoplay everywhere (iOS Safari requires
                              playsInline). `preload="metadata"` keeps
                              initial page weight low. */}
                          <video
                            src={item.src}
                            poster={item.poster}
                            muted
                            autoPlay
                            loop
                            playsInline
                            preload="metadata"
                            className="absolute inset-0 h-full w-full object-contain"
                          />
                          {/* Play-icon overlay so the user knows it's a
                              real video, not a silent GIF. Pointer-events
                              none so clicks fall through to the button. */}
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 flex items-center justify-center"
                          >
                            <span className="glass inline-flex h-10 w-10 items-center justify-center rounded-full opacity-70 transition group-hover:opacity-100">
                              <Play className="h-4 w-4 text-foreground" />
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    {item.caption && (
                      <span className="block px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
                        {item.caption}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Lightbox modal — rendered once per case-study, hosts whichever
            gallery index is open (or `-1` for closed). State is local to
            this component so opening M3's gallery doesn't affect TraySoft. */}
        {hasGallery && (
          <GalleryLightbox
            items={entry.gallery!}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(-1)}
            onChange={setLightboxIndex}
          />
        )}

        {/* Status footer */}
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

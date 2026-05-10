/**
 * ResumeNative — dark-themed React render of the one-page resume.
 *
 * Why this exists:
 *   /about-me used to <iframe> a printable HTML resume. The HTML lived in
 *   `public/about/resume.html` with a navy/cream/red palette designed for
 *   letter paper. Inside our dark glass site that looked jarring. This
 *   component re-renders the same content in the site's own theme.
 *
 *   The HTML file is preserved verbatim — the "Open original HTML" link
 *   in the page still serves it for users who want the print-style view
 *   or the PDF source-of-truth.
 *
 * Data source: `RESUME` from `src/data/career.ts` (typed structured data,
 * NOT parsed from the HTML at runtime).
 *
 * Server Component — pure data → JSX. No state, no events.
 *
 * Concept showcase (for beginners):
 *   - **Re-rendering the same content in two themes** is exactly what
 *     server-rendered React is great at: data is the source of truth,
 *     the view is a function of it.
 *   - **Helper components** (`SectionHead`, `Bullet`, `JobBlock`) live in
 *     this file because they're tiny and only used here. If we need them
 *     elsewhere later we can promote them.
 *   - **`renderInlineBold`**: the data uses `**bold**` markers for
 *     emphasis so it stays portable. We split on the marker and wrap
 *     odd-indexed chunks in <strong>. Clearer than a regex for beginners.
 */

import {
  Briefcase,
  Building2,
  Code,
  Database,
  GraduationCap,
  Server,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";

import { Reveal } from "@/components/animations/Reveal";
import { EDUCATION, RESUME } from "@/data/career";

// ─── Inline-bold helper ───────────────────────────────────────────────────
//
// Takes a string with `**bold**` markers and returns a fragment with the
// odd-indexed segments wrapped in <strong>. Example:
//   "Hello **world**, hi" → ["Hello ", <strong>world</strong>, ", hi"]
//
// We split on `**` so the output array alternates plain / bold / plain /
// bold. The index parity test is: odd index → bold, even → plain.
function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split("**");
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

// ─── Section heading inside the resume body ───────────────────────────────
//
// Mirrors the `<h2 class="sec">` style of the original HTML but in our
// dark theme: monospace eyebrow + thin accent underline.
function SectionHead({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-4 flex items-center gap-2 border-b border-accent-cyan/30 pb-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-cyan">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </h3>
  );
}

// ─── Single bullet row ────────────────────────────────────────────────────
//
// A small dot + body, with inline bold support.
function Bullet({ children }: { children: string }) {
  return (
    <li className="relative pl-5 text-sm leading-relaxed text-foreground-muted">
      <span
        aria-hidden
        className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-accent-cyan/80"
      />
      {renderInlineBold(children)}
    </li>
  );
}

// ─── One job entry ────────────────────────────────────────────────────────
function JobBlock({ job }: { job: (typeof RESUME.jobs)[number] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <span className="text-base font-semibold text-foreground">
            {job.title}
          </span>
          <span className="ml-1.5 text-sm font-medium text-accent-cyan">
            — {job.company}
          </span>
          {job.tag && (
            <span className="ml-2 inline-block rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 align-middle font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
              {job.tag}
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] italic text-foreground-muted">
          {job.date}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
        {job.description}
      </p>

      <ul className="mt-3 space-y-1.5">
        {job.bullets.map((b, i) => (
          <Bullet key={i}>{b}</Bullet>
        ))}
      </ul>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export function ResumeNative(): React.JSX.Element {
  return (
    <Reveal direction="up" amount={0.1}>
      {/*
        Two-column desktop layout: sidebar (stats + skills + education) on
        the left, main resume content on the right. Stacks on mobile.
        `lg:grid-cols-[18rem_1fr]` is Tailwind arbitrary-value syntax —
        a fixed sidebar width with the rest fluid.
      */}
      <div className="glass overflow-hidden rounded-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr]">
          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <aside className="space-y-7 border-b border-white/10 bg-white/[0.02] p-6 lg:border-b-0 lg:border-r">
            {/* Stats — mirrors the original "At a Glance" block */}
            <div>
              <SectionHead icon={TrendingUp}>At a glance</SectionHead>
              <ul className="space-y-2.5">
                {RESUME.stats.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-baseline gap-3 border-b border-dashed border-white/10 pb-2.5 last:border-b-0 last:pb-0"
                  >
                    <span className="min-w-[3rem] text-2xl font-bold text-accent-cyan">
                      {s.value}
                    </span>
                    <span className="text-xs leading-snug text-foreground-muted">
                      {s.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core competencies */}
            <div>
              <SectionHead icon={Target}>Core competencies</SectionHead>
              <ul className="space-y-1.5">
                {RESUME.competencies.map((c) => (
                  <li
                    key={c}
                    className="relative pl-4 text-xs text-foreground-muted"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-1.5 h-1 w-1 rounded-full bg-accent-cyan"
                    />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech stack pills */}
            <div>
              <SectionHead icon={Code}>Tech stack</SectionHead>
              <ul className="flex flex-wrap gap-1.5">
                {RESUME.techStack.map((t) => (
                  <li
                    key={t}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-foreground"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] italic text-foreground-muted">
                {RESUME.techStackNote}
              </p>
            </div>

            {/* Education */}
            <div>
              <SectionHead icon={GraduationCap}>Education</SectionHead>
              <p className="text-sm font-semibold text-foreground">
                {EDUCATION.degree}
              </p>
              <p className="text-xs text-foreground-muted">
                {EDUCATION.school}
              </p>
              <p className="mt-1 font-mono text-[10px] italic text-foreground-muted">
                {EDUCATION.dates} · {EDUCATION.mode}
              </p>
            </div>
          </aside>

          {/* ── Main column ────────────────────────────────────────────── */}
          <main className="space-y-7 p-6 sm:p-8">
            {/* Name + role band */}
            <header>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Shamar T. Patnett
              </h2>
              <span className="mt-2 inline-block rounded-md bg-accent-violet/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-violet ring-1 ring-accent-violet/30">
                {RESUME.role}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
                {RESUME.tagline}
              </p>
            </header>

            {/* Professional summary */}
            <section>
              <SectionHead icon={Briefcase}>Professional summary</SectionHead>
              <p className="text-sm leading-relaxed text-foreground-muted sm:text-[15px]">
                {RESUME.summary}
              </p>
            </section>

            {/* Experience — stacked job blocks */}
            <section>
              <SectionHead icon={Building2}>Professional experience</SectionHead>
              <div className="space-y-4">
                {RESUME.jobs.map((job) => (
                  <JobBlock key={job.title + job.company} job={job} />
                ))}
              </div>
            </section>

            {/* Notable projects */}
            <section>
              <SectionHead icon={Server}>Notable projects</SectionHead>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {RESUME.projects.map((p) => (
                  <div
                    key={p.name}
                    className="rounded-xl border-l-2 border-accent-cyan bg-white/[0.02] p-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {p.name}
                      </span>
                      <span className="font-mono text-[9px] italic uppercase tracking-wider text-accent-cyan">
                        {p.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                      {renderInlineBold(p.description)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer bar — small visual close, mirrors the gold/red ribbon
                of the original. Decorative only. */}
            <div
              aria-hidden
              className="flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] text-foreground-muted"
            >
              <Shield className="h-3 w-3" />
              <span>Resume rendered natively · {RESUME.role}</span>
              <Database className="ml-auto h-3 w-3" />
            </div>
          </main>
        </div>
      </div>
    </Reveal>
  );
}

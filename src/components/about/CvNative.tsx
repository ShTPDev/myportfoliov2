/**
 * CvNative — dark-themed React render of the multi-page CV.
 *
 * Counterpart to `ResumeNative`. Renders the long-form CV content (cover
 * letter is intentionally NOT rendered here — it is targeted at one
 * specific employer and lives in `public/about/cv.html` for download).
 *
 * What we render:
 *   - Professional profile
 *   - Key achievements
 *   - Experience (jobs with optional sub-sections)
 *   - Notable projects
 *   - Skills matrix (table)
 *   - Professional competencies
 *
 * Server Component. Data: `CV` from `src/data/career.ts`.
 *
 * Concept showcase:
 *   - **Optional discriminated shape** — a `CvJob` either has `bullets`
 *     OR `sections` (each with its own bullets). We render each branch
 *     conditionally. (`?.` optional chaining + truthy fallback.)
 *   - Re-uses the inline-bold helper pattern from `ResumeNative`. We
 *     keep a private copy here rather than promoting to a shared file
 *     because the helper is only ~10 lines and shared abstractions
 *     paid for too early hurt readability.
 */

import {
  BookOpen,
  Briefcase,
  Building2,
  FileText,
  Server,
  Sparkles,
  Target,
} from "lucide-react";

import { Reveal } from "@/components/animations/Reveal";
import { CV } from "@/data/career";

// ─── Inline-bold helper (local copy — same as ResumeNative) ───────────────
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

// ─── Single job entry (handles both "flat bullets" and "sections" shapes) ─
function CvJobBlock({ job }: { job: (typeof CV.jobs)[number] }) {
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

      {/*
        If the job has multiple labelled sub-sections, render each as a
        small heading + bullet group. Otherwise fall through to a flat
        list of `bullets`. Both branches return JSX; the `&&` operator
        only renders when the left side is truthy.
      */}
      {job.sections && job.sections.length > 0 && (
        <div className="mt-4 space-y-4">
          {job.sections.map((sec) => (
            <div key={sec.heading}>
              <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground">
                {sec.heading}
              </h4>
              <ul className="space-y-1.5">
                {sec.bullets.map((b, i) => (
                  <Bullet key={i}>{b}</Bullet>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {job.bullets && job.bullets.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {job.bullets.map((b, i) => (
            <Bullet key={i}>{b}</Bullet>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
export function CvNative(): React.JSX.Element {
  return (
    <Reveal direction="up" amount={0.1}>
      <div className="glass space-y-8 rounded-3xl p-6 sm:p-8">
        {/* Profile */}
        <section>
          <SectionHead icon={Briefcase}>Professional profile</SectionHead>
          <p className="text-sm leading-relaxed text-foreground-muted sm:text-[15px]">
            {CV.profile}
          </p>
        </section>

        {/* Key achievements */}
        <section>
          <SectionHead icon={Sparkles}>Key achievements</SectionHead>
          <ul className="space-y-2">
            {CV.achievements.map((a, i) => (
              <Bullet key={i}>{a}</Bullet>
            ))}
          </ul>
        </section>

        {/* Experience */}
        <section>
          <SectionHead icon={Building2}>Professional experience</SectionHead>
          <div className="space-y-4">
            {CV.jobs.map((j) => (
              <CvJobBlock key={j.title + j.company} job={j} />
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <SectionHead icon={Server}>Notable projects & systems</SectionHead>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {CV.projects.map((p) => (
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

        {/* Skills table */}
        <section>
          <SectionHead icon={BookOpen}>Technical skills & tools</SectionHead>
          {/*
            <dl> ("description list") is the semantic match for label/value
            pairs. We render each row as a flex pair so the label column
            aligns on lg+ and stacks cleanly on small screens.
          */}
          <dl className="divide-y divide-white/5 rounded-xl border border-white/10 bg-white/[0.02]">
            {CV.skills.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
              >
                <dt className="font-mono text-[11px] uppercase tracking-wider text-accent-cyan">
                  {row.label}
                </dt>
                <dd className="text-sm leading-relaxed text-foreground-muted">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Competencies — two-column chip grid */}
        <section>
          <SectionHead icon={Target}>Professional competencies</SectionHead>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CV.competencies.map((c) => (
              <li
                key={c}
                className="relative rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 pl-7 text-sm text-foreground-muted"
              >
                <span
                  aria-hidden
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-cyan"
                >
                  ◆
                </span>
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Footer bar — small "rendered natively" disclosure */}
        <div
          aria-hidden
          className="flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] text-foreground-muted"
        >
          <FileText className="h-3 w-3" />
          <span>CV rendered natively · download for printable version</span>
        </div>
      </div>
    </Reveal>
  );
}

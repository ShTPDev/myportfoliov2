/**
 * EducationBlock — focused glass card for the B.Sc. credential.
 *
 * Extracted out of the old Quick-Facts grid so the degree details
 * (modules, certificate ID, dates) get the room they deserve without
 * crowding the at-a-glance facts. Designed to sit alongside the career
 * timeline rather than replace it.
 *
 * Server Component. Data from `EDUCATION` in `src/data/career.ts`.
 *
 * Concept showcase:
 *   - Read-only data import + flat JSX → one of the cleanest possible
 *     React patterns. No state, no effects, no client boundary.
 */

import { GraduationCap } from "lucide-react";

import { EDUCATION } from "@/data/career";

export function EducationBlock(): React.JSX.Element {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-start gap-4">
        {/* Icon block — fixed-size square so the layout is stable even if
            the headings wrap on small screens. */}
        <div
          aria-hidden
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent-cyan/15 ring-1 ring-accent-cyan/30"
        >
          <GraduationCap className="h-5 w-5 text-accent-cyan" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan">
            Education
          </div>

          <h3 className="mt-1.5 text-lg font-semibold text-foreground">
            {EDUCATION.degree}
          </h3>

          <p className="mt-0.5 text-sm text-foreground-muted">
            {EDUCATION.school} · {EDUCATION.mode} · {EDUCATION.dates}
          </p>

          {/*
            Modules are CV-ish detail — kept short so the card doesn't
            balloon. The longer skills matrix lives in the resume/CV
            sections.
          */}
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
            <span className="font-medium text-foreground">Modules:</span>{" "}
            {EDUCATION.modules}
          </p>

          <p className="mt-2 font-mono text-[11px] text-foreground-muted">
            Certificate of Graduation ID: {EDUCATION.certificateId}
          </p>
        </div>
      </div>
    </div>
  );
}

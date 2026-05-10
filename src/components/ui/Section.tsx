/**
 * Section — semantic <section> wrapper with consistent spacing + heading slot.
 *
 * Why? Every page has multiple sections (Hero, About, Projects, Contact). A
 * single primitive keeps padding/typography uniform across them.
 *
 * Concept showcase:
 *  - Optional props (`eyebrow?`, `title?`, `description?`).
 *  - `id` prop wires hash-link navigation (e.g. <a href="#about">).
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto w-full max-w-6xl px-6 py-20 sm:py-28",
        className,
      )}
    >
      {(eyebrow || title || description) && (
        <header className="mb-10 max-w-2xl">
          {eyebrow && (
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent-cyan">
              {eyebrow}
            </span>
          )}
          {title && (
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-4 text-base text-foreground-muted sm:text-lg">
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

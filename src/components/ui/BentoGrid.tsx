/**
 * BentoGrid + BentoCard — reusable "bento box" layout primitive.
 *
 * Concept: a bento grid is a CSS-grid where individual cards can span
 * different numbers of columns/rows, creating an asymmetric, magazine-like
 * layout. We expose a `span` prop on BentoCard that maps to Tailwind classes.
 *
 * Concept showcase:
 *  - **Discriminated union literals** — `span` is constrained to a few exact
 *    string values, so TS will autocomplete and reject typos. This is the
 *    typical "enum-but-leaner" pattern in TS.
 *  - **`Record<K, V>` utility type** — a typed lookup table mapping each
 *    `Span` literal to the Tailwind class for that span.
 *  - **Optional props with defaults** — `span = "1x1"` gives the prop a
 *    default value at the destructuring point.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// `Span` is a *union of string literals*. TS treats this like an enum:
// only these 4 strings are valid for the `span` prop.
type Span = "1x1" | "2x1" | "1x2" | "2x2";

// `Record<Span, string>` = "an object whose keys are every value of Span,
// and whose values are strings". TS will error if we forget a key.
const SPAN_CLASS: Record<Span, string> = {
  "1x1": "md:col-span-1 md:row-span-1",
  "2x1": "md:col-span-2 md:row-span-1",
  "1x2": "md:col-span-1 md:row-span-2",
  "2x2": "md:col-span-2 md:row-span-2",
};

export function BentoGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // 1 column on mobile, 3 columns from md up. `auto-rows-[14rem]` gives
        // every grid row a base height; cards with `1x2` then occupy 2 rows.
        "grid grid-cols-1 gap-4 md:grid-cols-3 auto-rows-[14rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  children,
  span = "1x1",
  className,
}: {
  children: ReactNode;
  span?: Span;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass group relative flex flex-col overflow-hidden rounded-2xl p-6 transition hover:-translate-y-0.5 hover:bg-white/10",
        SPAN_CLASS[span],
        className,
      )}
    >
      {children}
    </div>
  );
}

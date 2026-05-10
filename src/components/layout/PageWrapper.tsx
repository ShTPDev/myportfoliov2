/**
 * PageWrapper — standard horizontal padding + max-width container.
 *
 * Use for any inner page so widths/paddings stay consistent. The `className`
 * prop lets callers add or override styles per-page.
 *
 * Concept showcase:
 *  - Inline TS object type for props (`{ children, className }: { ... }`).
 *  - `className?: string` — the `?` marks the prop optional.
 *  - `cn()` from lib/utils merges base + caller-provided classes safely.
 */

import { cn } from "@/lib/utils";

export function PageWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-6 py-16 sm:py-24",
        className,
      )}
    >
      {children}
    </div>
  );
}

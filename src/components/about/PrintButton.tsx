/**
 * PrintButton — small client button that triggers `window.print()`.
 *
 * Why a whole file for one button? Because `window.print()` is a browser
 * API and can only be called from a Client Component. Keeping it in its
 * own file means the rest of the about-page tree (which is mostly server
 * rendered) doesn't need to be marked `"use client"` just to host this
 * one button.
 *
 * Concept showcase (for beginners):
 *   - **`"use client"` for tiny islands** — the React 19 + Next App Router
 *     pattern is "default to server, opt into client for the smallest
 *     piece that needs it". This file is the canonical tiny example.
 *   - **`onClick` is a function reference**, not a string. The arrow
 *     function lets us pass `() => window.print()` without `this` issues.
 */

"use client";

import { Printer } from "lucide-react";

export function PrintButton({
  label = "Print this section",
}: {
  /** Visible button text — defaults to "Print this section". */
  label?: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground transition hover:border-white/20"
    >
      <Printer className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}

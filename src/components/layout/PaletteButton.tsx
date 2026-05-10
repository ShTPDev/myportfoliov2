/**
 * PaletteButton — tiny ⌘K trigger button rendered in the Navbar.
 *
 * What this file does
 *   Renders a small icon button. Clicking it dispatches a custom DOM
 *   event (`palette:open`) on `window`. The `<CommandPalette />`
 *   component, mounted once in the root layout, listens for that event
 *   and opens itself.
 *
 * Why a CLIENT component?
 *   It needs an `onClick` handler — which is React state-machinery that
 *   only exists in the browser. Server components can't attach event
 *   listeners.
 *
 * Why a separate file (rather than inlining in Navbar.tsx)?
 *   Navbar is a Server Component. Adding "use client" at the top of
 *   Navbar would force the whole navbar (including the SSR-friendly
 *   <Link>s) into the client bundle. By isolating the interactive bit
 *   into its own file, only THIS button becomes client-side.
 *
 * Concept demonstrated
 *   - The "client island" pattern: a server-rendered tree with small
 *     interactive leaves.
 *   - Custom DOM events as a decoupled message bus between sibling
 *     components.
 *   - Importing a constant (`PALETTE_OPEN_EVENT`) instead of hardcoding
 *     the event name string — typo-proof.
 */

"use client";

import { Command } from "lucide-react";
import { PALETTE_OPEN_EVENT } from "./CommandPalette";

type PaletteButtonProps = Readonly<{
  className?: string;
}>;

export function PaletteButton({ className = "" }: PaletteButtonProps) {
  return (
    <button
      type="button"
      // Dispatch the open event. Any component listening for
      // `PALETTE_OPEN_EVENT` will react — currently just <CommandPalette />.
      onClick={() => window.dispatchEvent(new Event(PALETTE_OPEN_EVENT))}
      aria-label="Open command palette"
      title="Open command palette (⌘K)"
      className={
        // Glass-pill style matching the rest of the navbar controls.
        // `gap-1` separates the icon from the K glyph.
        "items-center gap-1 rounded-full glass px-2.5 py-1.5 text-xs font-mono text-foreground-muted transition-colors hover:text-foreground " +
        className
      }
    >
      <Command aria-hidden="true" className="h-3.5 w-3.5" />
      <span>K</span>
    </button>
  );
}

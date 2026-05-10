/**
 * CopyButton — tiny pill button that copies a string to the clipboard.
 *
 * Why a CLIENT component?
 *  - `navigator.clipboard.writeText(...)` is a browser API. Server
 *    components run on the server (no `navigator`), so this file MUST start
 *    with `"use client"`.
 *  - We also need state to flash "Copied!" briefly after success, and
 *    state can only live in client components.
 *
 * Props:
 *  - `value`     — string to copy.
 *  - `label`     — accessible label for screen readers (e.g. "Copy email").
 *  - `className` — optional override for positioning inside the parent row.
 *
 * Concepts demonstrated:
 *  - `"use client"` boundary marker.
 *  - `useState<boolean>` + `useEffect` cleanup for a brief UI flash.
 *  - Returning the cleanup function from `useEffect` so the timeout is
 *    cancelled if the component unmounts mid-flash (avoids the React
 *    warning about state updates on unmounted components).
 *  - Conditional icon swap (`Copy` ↔ `Check`).
 *  - `aria-live="polite"` so assistive tech announces the "Copied!" state
 *    without interrupting.
 *  - `event.stopPropagation()` + `event.preventDefault()` — we sit INSIDE
 *    a wrapping `<a>` tag in the parent row. Without preventing propagation
 *    a click would also follow the mailto/tel link.
 */

"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}): React.JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);

  /**
   * When `copied` flips true, schedule a flip back to false 1.5s later.
   * The effect's RETURN VALUE is the cleanup function — React calls it
   * before re-running the effect or when the component unmounts. Without
   * it, a quick unmount during the flash would leak the timeout AND try to
   * `setCopied` on a dead component (React 19 still warns).
   */
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [copied]);

  /**
   * Click handler — copies the value, flips to "Copied!" state.
   *
   * Why `MouseEvent<HTMLButtonElement>`?
   *  - React types DOM events generically by element type. Picking the
   *    right one gives us autocomplete on `event.currentTarget`.
   *
   * Why `stopPropagation` + `preventDefault`?
   *  - The parent contact row is a `<a href="mailto:…">`. A click anywhere
   *    inside it (including on this button) bubbles up and follows the
   *    link. We want the button to copy, not navigate. Both calls together
   *    are belt-and-suspenders against different browsers.
   */
  async function handleClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    event.stopPropagation();
    event.preventDefault();

    try {
      // `navigator.clipboard` requires a secure context (HTTPS or
      // localhost). If it's missing/blocked, we silently fall through —
      // the button just doesn't flash. Users still have the mailto/tel
      // fallback in the row.
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }
    } catch {
      // Swallow — clipboard API can throw on permission errors. No-op is
      // fine; the user can still select/copy manually from the row.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      // `aria-label` gives a screen-reader-only description that's more
      // helpful than "Copy" alone (e.g. "Copy email").
      aria-label={copied ? `${label} — copied` : label}
      // `aria-live="polite"` on the visible text would announce every time
      // the label changes; we put it on the wrapper so changes from "Copy"
      // → "Copied!" are read out without interrupting.
      aria-live="polite"
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-foreground-muted ring-1 ring-white/10 transition-colors hover:bg-white/5 hover:text-foreground " +
        (className ?? "")
      }
    >
      {copied ? (
        <>
          <Check size={12} aria-hidden="true" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy size={12} aria-hidden="true" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

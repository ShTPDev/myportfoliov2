/**
 * ResumeButton — small glass pill that opens /resume.pdf in a new tab.
 *
 * Two ways to trigger it:
 *  1. Click / tap the button.
 *  2. Press the `r` key anywhere on the page (when no input is focused).
 *
 * Why the keyboard guard matters
 * ------------------------------
 * If we listened for `r` unconditionally, typing the letter "r" inside the
 * contact form (or any other input) would fire the resume download mid-word.
 * That's the kind of bug that silently ruins keyboard UX.
 *
 * The fix: before acting, ask "is the user currently typing into something?"
 * `document.activeElement` is the DOM element that currently owns keyboard
 * focus — the <input>, <textarea>, contenteditable region, etc. We bail out
 * if it's any of those. We also bail if a modifier (Ctrl/Cmd/Alt) is held,
 * so we don't hijack the browser's `Ctrl+R` reload shortcut.
 *
 * The `useEffect` cleanup function removes the listener when the component
 * unmounts. Forgetting that is a classic React leak — every navigation away
 * and back would stack another listener, and pressing `r` would trigger N
 * downloads.
 *
 * Concepts demonstrated
 * ---------------------
 *  - **`"use client"`** — needed because we attach a window-level event
 *    listener and use `useEffect`.
 *  - **`useEffect` cleanup** — the function we return removes the listener.
 *  - **Literal-union prop type** — `size?: "sm" | "md"` constrains callers to
 *    valid options at compile time. No "lg" silently accepted.
 *  - **`document.activeElement` + `instanceof`** — narrows `Element | null`
 *    to a concrete `HTMLInputElement` so TS lets us read `.tagName`.
 *  - **`Readonly` via inline literal type** — props are described inline; for
 *    bigger components prefer a named `type Props = { ... }`.
 */

"use client";

import { Download } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Where the file lives. `/resume.pdf` is served from `public/resume.pdf` —
 * Next.js maps everything in `public/` to the site root. The file doesn't
 * have to exist at build time; the link will just 404 until you drop the
 * PDF in.
 */
const RESUME_HREF = "/resume.pdf";

type ResumeButtonProps = {
  /**
   * `"sm"` is the navbar/hero variant (compact, font-mono, text-xs).
   * `"md"` is for prominent CTA rows (e.g. the Contact page).
   * Defaults to `"sm"` to match the existing Navbar pill aesthetic.
   */
  size?: "sm" | "md";
  className?: string;
};

/**
 * Returns true when the user is currently typing into something we shouldn't
 * hijack. We treat <input>, <textarea>, and any contenteditable element as
 * "do not interrupt". `<select>` is also keyboard-driven (typeahead), so we
 * include it for safety.
 */
function isUserTyping(): boolean {
  // `document.activeElement` is `Element | null`. We narrow it before reading
  // tag-specific properties.
  const el = document.activeElement;
  if (!el) return false;

  // `instanceof` checks against the *runtime* DOM constructor — it's the
  // right tool for telling an <input> from a <button>. TS narrows the type
  // accordingly inside the branch, but we don't need any input-specific
  // properties so a single tag check is enough.
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    return true;
  }

  // contenteditable can be on any element (e.g. a <div> rich-text editor).
  // The DOM exposes it as a boolean on `HTMLElement.isContentEditable`.
  if (el instanceof HTMLElement && el.isContentEditable) {
    return true;
  }

  return false;
}

export function ResumeButton({
  size = "sm",
  className,
}: ResumeButtonProps) {
  /**
   * Programmatic open — used by both the click handler and the `r` shortcut.
   * Declared BEFORE the effect that uses it so the React-Compiler-style
   * "no temporal dead zone" lint rule stays happy.
   *
   * `window.open(url, "_blank", "noopener,noreferrer")` is the safe form:
   *  - `noopener` prevents the new tab from reaching back into ours via
   *    `window.opener`.
   *  - `noreferrer` strips the Referer header.
   * Same hygiene as setting `rel="noreferrer"` on an <a target="_blank">.
   */
  const openResume = () => {
    window.open(RESUME_HREF, "_blank", "noopener,noreferrer");
  };

  /**
   * Global `r` shortcut. Mounted on `window` so the user can press `r`
   * anywhere on the page (not just when the button is focused).
   */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore if the user is typing.
      if (isUserTyping()) return;

      // Ignore browser/OS chord shortcuts so we don't hijack Ctrl+R / Cmd+R.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // `e.key` is the printable character; "R" with caps lock or shift
      // should still work — lowercase comparison covers both.
      if (e.key.toLowerCase() !== "r") return;

      // We *don't* preventDefault here — there's no native "r" action on a
      // page that's not in an editable region, so nothing to prevent.
      window.open(RESUME_HREF, "_blank", "noopener,noreferrer");
    };

    window.addEventListener("keydown", onKeyDown);
    // Cleanup runs on unmount. Returning the cleanup function from useEffect
    // is React's contract for "undo what you set up".
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Tailwind class buckets per size. We keep them as plain strings so
  // tailwind-merge (inside `cn`) can resolve any caller overrides.
  const sizeClasses =
    size === "md"
      ? "px-5 py-2.5 text-sm"
      : "px-4 py-1.5 text-xs";

  return (
    <button
      type="button"
      onClick={openResume}
      // `aria-keyshortcuts` advertises the keyboard shortcut to screen
      // readers and assistive tech. Spec: https://w3c.github.io/aria/#aria-keyshortcuts
      aria-keyshortcuts="r"
      // `title` is a low-effort tooltip for sighted users discovering the
      // shortcut. The native browser tooltip is plenty here.
      title="Download résumé (press R)"
      className={cn(
        "glass inline-flex items-center gap-2 rounded-full font-medium text-foreground transition hover:bg-white/10",
        sizeClasses,
        className,
      )}
    >
      <Download
        // `aria-hidden` because the visible text label "Résumé" already
        // conveys the action — no need for the icon to double-announce.
        aria-hidden="true"
        // Icon size scales with the button size for visual balance.
        className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"}
      />
      <span>Résumé</span>
      {/*
        Keyboard hint chip. Hidden on small screens (where keyboards aren't
        the primary input). The `kbd` element is the semantic tag for "user
        keyboard input" — browsers style it as monospace by default.
      */}
      <kbd className="ml-1 hidden rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-foreground-muted sm:inline">
        R
      </kbd>
    </button>
  );
}

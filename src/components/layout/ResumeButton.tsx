/**
 * ResumeButton — small glass pill that takes the user to the resume preview.
 *
 * Behavior:
 *  - Click / tap → navigate to `/about-me` (the Meet-the-Engineer page,
 *    which has the embedded resume + CV preview AND the actual download
 *    buttons).
 *  - Press `r` anywhere on the page (when no input is focused) → same.
 *
 * Why route to a page instead of opening the PDF directly?
 *   The PDF may not exist yet (the source is `cv.html` / `resume.html`,
 *   which the owner exports to PDF on demand). Even when it does exist,
 *   sending visitors straight into a file download skips the preview +
 *   context that the /about-me page provides. The page itself has the
 *   "Download PDF" button right at the top of the resume section, so
 *   visitors who want the file are one click away — and visitors who
 *   want context get it.
 *
 * Why the keyboard guard matters
 * ------------------------------
 * If we listened for `r` unconditionally, typing the letter "r" inside the
 * contact form would fire the navigation mid-word. We bail out when an
 * input/textarea/contenteditable element owns focus, and when a modifier
 * (Ctrl/Cmd/Alt) is held (so `Ctrl+R` reload is preserved).
 *
 * Concepts demonstrated
 * ---------------------
 *  - **`useRouter` from `next/navigation`** — App Router's client-side
 *    navigation hook. Use inside event handlers, never in render.
 *  - **`useEffect` cleanup** — the function we return removes the listener.
 *  - **Literal-union prop type** — `size?: "sm" | "md"`.
 *  - **`document.activeElement` + `instanceof`** — narrows the focused
 *    element so we know whether to treat keystrokes as "user typing".
 */

"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Where to send the user. The `#resume` hash scrolls them straight to the
 * resume section once the page mounts (browsers handle this natively).
 */
const RESUME_TARGET = "/about-me#resume";

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
 * hijack. `<input>`, `<textarea>`, `<select>` (typeahead), and any
 * contenteditable element all qualify.
 */
function isUserTyping(): boolean {
  const el = document.activeElement;
  if (!el) return false;

  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    return true;
  }

  if (el instanceof HTMLElement && el.isContentEditable) {
    return true;
  }

  return false;
}

export function ResumeButton({
  size = "sm",
  className,
}: ResumeButtonProps) {
  // `useRouter` is the App Router's client-side navigation primitive.
  // Calling `router.push(href)` triggers a SPA-style navigation — no full
  // page reload, prefetched chunks reused.
  const router = useRouter();

  /**
   * Programmatic navigation, shared by the click handler and the `r`
   * shortcut so they always do the same thing.
   */
  const goToResume = () => {
    router.push(RESUME_TARGET);
  };

  /**
   * Global `r` shortcut. Mounted on `window` so the user can press `r`
   * anywhere on the page (not just when the button is focused).
   */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isUserTyping()) return;
      // Ignore browser/OS chord shortcuts so we don't hijack Ctrl+R / Cmd+R.
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Lowercase comparison covers Caps Lock + Shift.
      if (e.key.toLowerCase() !== "r") return;

      router.push(RESUME_TARGET);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // `router` from `useRouter()` is stable across renders, so the effect
    // really only runs once on mount. Including it satisfies React's deps
    // lint without causing re-subscription.
  }, [router]);

  // Tailwind class buckets per size. Plain strings so `tailwind-merge`
  // (inside `cn`) can resolve any caller overrides cleanly.
  const sizeClasses =
    size === "md" ? "px-5 py-2.5 text-sm" : "px-4 py-1.5 text-xs";

  return (
    <button
      type="button"
      onClick={goToResume}
      // `aria-keyshortcuts` advertises the keyboard shortcut to screen
      // readers and assistive tech. Spec: https://w3c.github.io/aria/#aria-keyshortcuts
      aria-keyshortcuts="r"
      title="View résumé (press R)"
      className={cn(
        "glass inline-flex items-center gap-2 rounded-full font-medium text-foreground transition hover:bg-white/10",
        sizeClasses,
        className,
      )}
    >
      <Download
        aria-hidden="true"
        className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"}
      />
      <span>Résumé</span>
      {/* Hidden on small screens (no keyboards there). `<kbd>` is the
          semantic tag for "user keyboard input" — browsers style it
          monospace by default. */}
      <kbd className="ml-1 hidden rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-foreground-muted sm:inline">
        R
      </kbd>
    </button>
  );
}

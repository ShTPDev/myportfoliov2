/**
 * ScrollToTop — forces window scroll to (0, 0) on every route change.
 *
 * Why this exists:
 *   The site has `html { scroll-behavior: smooth }` set in globals.css for
 *   nice in-page anchor jumps. But that CSS rule fights with Next.js' built-in
 *   "scroll to top on navigation" behaviour: instead of an instant snap,
 *   the browser tries to *smoothly* scroll, and if scroll-restoration is
 *   active you can land mid-page on a section that matches the prior
 *   scroll position.
 *
 *   This component sits in the root layout, listens to `usePathname`, and
 *   issues an explicit `window.scrollTo({ top: 0, behavior: "instant" })`
 *   whenever the path changes. Hash links (`/#section`) are left alone so
 *   anchor navigation still works.
 *
 * Concept showcase:
 *  - **`usePathname`** from `next/navigation` — reactive subscription to
 *    the current route segment. It's a hook, so this file must be `"use client"`.
 *  - **`useEffect` with `[pathname]` dep** — fires after every route change.
 *  - **`behavior: "instant"`** — overrides the page's `scroll-behavior:
 *    smooth` for this one call. Same scroll API, opt-out per call.
 *  - **`window.location.hash` guard** — if the URL has a fragment
 *    (`/#contact`), let the browser handle the in-page anchor; we don't
 *    want to override that.
 */

"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip if the URL has a hash — the user is targeting an anchor.
    if (typeof window === "undefined") return;
    if (window.location.hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // Renders nothing — this is a side-effect-only component.
  return null;
}

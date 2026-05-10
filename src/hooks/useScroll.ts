/**
 * useScrollProgress — current page scroll progress (0..1).
 *
 * Use for parallax bars, progress indicators, scroll-driven animations.
 *
 * Concept showcase:
 *  - **Closures in event handlers** — the `onScroll` function reads the
 *    latest `document.documentElement.scrollHeight` each call (not captured
 *    once), since we read it inside the handler.
 *  - **Math.min/max clamp** — keep the value in [0, 1] even at scroll bounce.
 */

"use client";

import { useEffect, useState } from "react";

export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? doc.scrollTop / max : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
    };
    onScroll(); // run once for initial value
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return progress;
}

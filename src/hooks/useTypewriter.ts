/**
 * useTypewriter — animate a string char-by-char for a typing effect.
 *
 * Concept showcase:
 *  - **`useState` initialized from prop** — start with "" (or text[0]).
 *  - **`setTimeout` cleanup** — `clearTimeout` in the effect cleanup, or the
 *    typewriter keeps running after unmount.
 *  - **Avoid synchronous setState in effects** — React 19 lint flags this.
 *    Reset state via the dep-keyed `useState(text)` initializer pattern OR
 *    schedule the reset asynchronously in a microtask.
 */

"use client";

import { useEffect, useState } from "react";

export function useTypewriter(
  text: string,
  speed: number = 28,
  startDelay: number = 0,
): { displayed: string; done: boolean } {
  // Key the state to text — when text changes, fresh state via remount-style
  // pattern: we DON'T reset inside useEffect (lint forbids sync setState there).
  // Instead, callers should remount the component if they need a hard reset.
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      i += 1;
      // Functional update — derives next state from current text.
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        return;
      }
      timer = setTimeout(tick, speed);
    };

    const start = setTimeout(tick, startDelay);

    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

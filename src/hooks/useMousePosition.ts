/**
 * useMousePosition — track cursor x/y in pixels relative to the viewport.
 *
 * Concept showcase:
 *  - **Custom hook** — any function whose name starts with `use` and that
 *    calls other hooks. Lets us reuse stateful logic across components.
 *  - **`useEffect` + cleanup** — register a window listener on mount, remove
 *    on unmount. Forgetting to clean up is the #1 React memory leak.
 *  - **`useState` for x/y** — `{ x: 0, y: 0 }` initial; updated on every move.
 *
 * Performance note: this re-renders the consumer on every mousemove. For
 * heavy use, prefer Framer Motion's `useMotionValue` (which doesn't re-render
 * React on every change). We'll show that pattern in HeroBackground.
 */

"use client";

import { useEffect, useState } from "react";

export interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(): MousePosition {
  const [pos, setPos] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    // Cleanup runs on unmount OR before the next effect re-run.
    return () => window.removeEventListener("mousemove", onMove);
  }, []); // empty dep array → effect runs once after mount

  return pos;
}

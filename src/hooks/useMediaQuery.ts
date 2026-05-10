/**
 * useMediaQuery — subscribe to a CSS media query, return current match.
 *
 * Concept showcase:
 *  - **`useSyncExternalStore`** — React hook designed exactly for subscribing
 *    to external sources (browser APIs, stores, sockets). It's the
 *    recommended pattern in React 18+ and is required in React 19 to avoid
 *    the "synchronous setState in useEffect" lint error.
 *  - It takes 3 args: subscribe, getSnapshot, getServerSnapshot.
 *      - subscribe: how to listen for changes (returns cleanup).
 *      - getSnapshot: read the current value on the client.
 *      - getServerSnapshot: SSR-safe initial value (`false` here).
 */

"use client";

import { useSyncExternalStore } from "react";

function getServerSnapshot(): boolean {
  return false; // SSR has no window; assume "doesn't match" before hydration.
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    getServerSnapshot,
  );
}

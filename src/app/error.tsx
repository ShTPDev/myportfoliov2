/**
 * error.tsx — error boundary for this segment.
 *
 * Special file convention. MUST be a Client Component (uses error state).
 * Receives a `reset` callback to retry the segment.
 *
 * Docs: node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md
 */

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook for error tracking (Sentry, etc.) later. For now: console.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <span className="font-mono text-xs text-foreground-muted">error</span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Something <span className="text-gradient">broke</span>.
      </h1>
      <p className="mt-3 text-foreground-muted">
        We hit an unexpected issue. Try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
      >
        Retry
      </button>
    </div>
  );
}

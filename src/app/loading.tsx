/**
 * loading.tsx — shown by Next.js Suspense while the segment streams.
 *
 * Special file convention. Wraps children in a <Suspense> with this UI as
 * the fallback. No client JS needed for a simple skeleton.
 */

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-32">
      <span className="font-mono text-xs text-foreground-muted">loading…</span>
    </div>
  );
}

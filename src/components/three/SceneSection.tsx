/**
 * SceneSection — full-section presentation of the 3D scene with copy overlay.
 *
 * Phase 6 perf:
 *  - Skip rendering the WebGL scene on small screens (CPUs/GPUs strain).
 *  - Skip if the user prefers reduced motion (a11y).
 *  - Lazy-load Scene with `ssr: false` (Three.js needs window).
 *
 * Docs: node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md
 */

"use client";

import dynamic from "next/dynamic";
import { Section } from "@/components/ui/Section";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const Fallback = () => (
  <div className="flex h-full items-center justify-center">
    <span className="font-mono text-xs text-foreground-muted">
      booting WebGL…
    </span>
  </div>
);

const Scene = dynamic(
  () => import("./Scene").then((m) => m.Scene),
  { ssr: false, loading: Fallback },
);

export function SceneSection() {
  const isSmall = useMediaQuery("(max-width: 640px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // On mobile or when user requests reduced motion, show a static placeholder
  // instead of the full WebGL scene. Saves battery, avoids motion sickness.
  const skip = isSmall || reducedMotion;

  return (
    <Section
      id="scene"
      eyebrow="Live"
      title="Real-time 3D — built straight into the page."
      description="A small WebGL scene: 1200 particles + wireframe primitives, all driven by react-three-fiber."
    >
      <div className="glass relative overflow-hidden rounded-2xl">
        <div className="aspect-[16/9] w-full">
          {skip ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <span className="font-mono text-xs uppercase tracking-wider text-foreground-muted">
                {reducedMotion ? "reduced motion" : "mobile · perf mode"}
              </span>
              <span className="text-sm text-foreground-muted">
                Static placeholder — open on a larger screen for the live scene.
              </span>
            </div>
          ) : (
            <Scene />
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      </div>
    </Section>
  );
}

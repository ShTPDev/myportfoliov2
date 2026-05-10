/**
 * SceneSection — full-section presentation of the 3D scene with copy overlay.
 *
 * Why dynamic import with `ssr: false`?
 *   Three.js touches browser-only globals (`window`, `WebGL`) at module
 *   load time. If we imported `<Scene>` directly into a server-rendered
 *   page, the build would fail. `next/dynamic({ ssr: false })` defers the
 *   import to the client and shows a fallback during load.
 *
 * Docs reminder: in Next.js 16 dynamic imports remain the canonical way to
 * gate client-only modules. See node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md
 */

"use client";

import dynamic from "next/dynamic";
import { Section } from "@/components/ui/Section";

// Skeleton shown during chunk download.
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
  return (
    <Section
      id="scene"
      eyebrow="Live"
      title="Real-time 3D — built straight into the page."
      description="A small WebGL scene: 1200 particles + wireframe primitives, all driven by react-three-fiber."
    >
      <div className="glass relative overflow-hidden rounded-2xl">
        <div className="aspect-[16/9] w-full">
          <Scene />
        </div>
        {/* Soft vignette so the canvas blends with the page background. */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      </div>
    </Section>
  );
}

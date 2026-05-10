/**
 * Scene — the <Canvas> root containing all 3D content.
 *
 * Why a thin wrapper file?
 *   We import this scene LAZILY from a section component (via
 *   `next/dynamic` with `ssr: false`). Three.js touches `window` and `WebGL`
 *   on import, so it cannot run during server-side rendering. The dynamic
 *   import skips it on the server and loads only on the client.
 *
 * Concept showcase:
 *  - **`<Canvas>` from r3f** — creates the WebGL renderer + camera + scene.
 *    Everything inside is a Three.js scene tree.
 *  - **Camera + lights via JSX** — `<ambientLight />`, `<perspectiveCamera />`
 *    map directly to THREE classes. Defaults are fine for our case.
 */

"use client";

import { Canvas } from "@react-three/fiber";
import { Particles } from "./Particles";
import { FloatingObjects } from "./FloatingObjects";

export function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      // Avoid layout shift; container controls size via CSS.
      style={{ width: "100%", height: "100%" }}
      dpr={[1, 1.5]} // device-pixel-ratio range; cap for perf
    >
      <ambientLight intensity={0.4} />
      <Particles count={1200} radius={5} color="#8b5cf6" />
      <FloatingObjects />
    </Canvas>
  );
}

/**
 * Particles — point cloud rendered with Three.js via @react-three/fiber.
 *
 * Concept showcase:
 *  - **react-three-fiber** — Three.js as React JSX. `<points>` ↔ THREE.Points.
 *  - **`useFrame`** — animation hook running every frame inside a Canvas.
 *  - **Pure components** — React 19 enforces purity in render. `Math.random`
 *    is impure; instead we use a *seeded PRNG* (mulberry32) so the same input
 *    always produces the same point cloud → safe inside `useMemo`.
 *  - **`Float32Array`** — typed array for GPU-friendly position data.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Deterministic PRNG: same seed → same sequence. Fine for visual noise.
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Particles({
  count = 1500,
  radius = 6,
  color = "#8b5cf6",
  seed = 1337,
}: {
  count?: number;
  radius?: number;
  color?: string;
  seed?: number;
}) {
  const ref = useRef<THREE.Points>(null);

  // Generate positions ONCE, deterministically. 3 floats per point (x,y,z).
  const positions = useMemo(() => {
    const rand = mulberry32(seed);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * Math.cbrt(rand()); // cbrt → uniform in volume
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count, radius, seed]);

  // `delta` = seconds since last frame → framerate-independent motion.
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
      ref.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.7}
      />
    </points>
  );
}

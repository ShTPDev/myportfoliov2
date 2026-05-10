/**
 * FloatingObjects — a few wireframe shapes drifting in 3D space.
 *
 * Concept showcase:
 *  - **Multiple meshes in one scene** — each <mesh> is a Three.Mesh.
 *  - **Geometry + Material as JSX children** — declarative way to build a mesh.
 *  - **`useFrame` mutates refs directly** — DON'T call setState here; it would
 *    re-render every frame. Mutate the THREE object's transform instead.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface ShapeProps {
  position: [number, number, number];
  speed: number;
  color: string;
}

function Cube({ position, speed, color }: ShapeProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * speed;
    ref.current.rotation.y += delta * speed * 0.7;
    // Gentle bob in y.
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshBasicMaterial color={color} wireframe />
    </mesh>
  );
}

function Octa({ position, speed, color }: ShapeProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x -= delta * speed * 0.6;
    ref.current.rotation.z += delta * speed;
    ref.current.position.y =
      position[1] + Math.cos(state.clock.elapsedTime * speed) * 0.25;
  });
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.45, 0]} />
      <meshBasicMaterial color={color} wireframe />
    </mesh>
  );
}

export function FloatingObjects() {
  return (
    <group>
      <Cube position={[-2.6, 0.4, -1]} speed={0.6} color="#00f5ff" />
      <Octa position={[2.4, -0.6, 0]} speed={0.9} color="#8b5cf6" />
      <Cube position={[1.5, 1.6, -1.5]} speed={0.4} color="#3b82f6" />
      <Octa position={[-1.8, -1.3, 0.5]} speed={0.7} color="#00f5ff" />
    </group>
  );
}

/**
 * Home page (`/` route).
 *
 * Section order:
 *   Hero → About → Ecosystem → Architecture → Scene (3D) → Terminal → Services
 *
 * Server Component. Children mix server + client; Next handles the boundary.
 */

import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/hero/About";
import { EcosystemShowcase } from "@/components/ecosystem/EcosystemShowcase";
import { ArchitectureDiagram } from "@/components/ecosystem/ArchitectureDiagram";
import { SceneSection } from "@/components/three/SceneSection";
import { TerminalSection } from "@/components/terminal/TerminalSection";
import { ServicesGrid } from "@/components/ecosystem/ServicesGrid";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <EcosystemShowcase />
      <ArchitectureDiagram />
      <SceneSection />
      <TerminalSection />
      <ServicesGrid />
    </>
  );
}

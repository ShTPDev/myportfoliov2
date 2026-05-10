/**
 * Home page (`/` route).
 *
 * Section order:
 *   Hero → Stats → About → Ecosystem → Architecture → Scene → Terminal → Services
 *
 * Server Component. Children mix server + client; Next handles the boundary.
 */

import { Hero } from "@/components/hero/Hero";
import { Stats } from "@/components/hero/Stats";
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
      <Stats />
      <About />
      <EcosystemShowcase />
      <ArchitectureDiagram />
      <SceneSection />
      <TerminalSection />
      <ServicesGrid />
    </>
  );
}

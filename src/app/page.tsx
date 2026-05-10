/**
 * Home page (`/` route).
 *
 * Section order:
 *   Hero → SystemStatus → About → Ecosystem → Architecture → Terminal → Services
 *
 * Server Component. Children mix server + client; Next handles the boundary.
 *
 * The 3D `<SceneSection />` was removed — it served no portfolio purpose
 * for an IT-Manager / software-engineering pitch and added Three.js +
 * react-three-fiber to the bundle. The component file itself is kept on
 * disk under `src/components/three/` in case it's wanted again later.
 *
 * Similarly, the old `<Stats />` vanity-metric strip is no longer rendered;
 * `<SystemStatus />` (a live Stripe-style status bar fed from real GitHub
 * data + git SHA) replaces it. The Stats file is also kept on disk for
 * easy revert.
 */

import { Hero } from "@/components/hero/Hero";
import { SystemStatus } from "@/components/hero/SystemStatus";
import { About } from "@/components/hero/About";
import { EcosystemShowcase } from "@/components/ecosystem/EcosystemShowcase";
import { ArchitectureDiagram } from "@/components/ecosystem/ArchitectureDiagram";
import { TerminalSection } from "@/components/terminal/TerminalSection";
import { ServicesGrid } from "@/components/ecosystem/ServicesGrid";

export default function Home() {
  return (
    <>
      <Hero />
      <SystemStatus />
      <About />
      <EcosystemShowcase />
      <ArchitectureDiagram />
      <TerminalSection />
      <ServicesGrid />
    </>
  );
}

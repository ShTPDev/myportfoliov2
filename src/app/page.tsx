/**
 * Home page (`/` route).
 *
 * Section order:
 *   Hero → SystemStatus → About → Ecosystem → Architecture → Scene → Terminal → Services
 *
 * Server Component. Children mix server + client; Next handles the boundary.
 *
 * Note on `SystemStatus`: it's an *async* Server Component that fetches
 * GitHub data with a 1-hour cache. Because it's async, marking the parent
 * `Home` async too would be equally valid — but Next allows nested async
 * components without the parent needing to await them, and that's what we
 * use here. (The parent renders its children, Next streams them in.)
 *
 * `Stats` (the old vanity-metric strip) is intentionally still imported
 * elsewhere — actually it's NOT imported anymore here. The file is left
 * on disk in `src/components/hero/Stats.tsx` for easy revert.
 */

import { Hero } from "@/components/hero/Hero";
import { SystemStatus } from "@/components/hero/SystemStatus";
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
      {/* SystemStatus replaced the old <Stats /> "vanity metrics" strip.
          It renders a Stripe-style live ops status bar instead. */}
      <SystemStatus />
      <About />
      <EcosystemShowcase />
      <ArchitectureDiagram />
      <SceneSection />
      <TerminalSection />
      <ServicesGrid />
    </>
  );
}

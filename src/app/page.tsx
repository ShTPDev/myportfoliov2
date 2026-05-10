/**
 * Home page (`/` route).
 *
 * Section order:
 *   Hero → Stats → About → Ecosystem → GitHub → Architecture → Scene → Terminal → Services
 *
 * Server Component. Children mix server + client; Next handles the boundary.
 *
 * `GitHubPreview` is an *async* server component — it awaits `fetch` calls
 * before rendering. That's only legal in Server Components.
 */

import { Hero } from "@/components/hero/Hero";
import { Stats } from "@/components/hero/Stats";
import { About } from "@/components/hero/About";
import { EcosystemShowcase } from "@/components/ecosystem/EcosystemShowcase";
import { GitHubPreview } from "@/components/ecosystem/GitHubPreview";
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
      <GitHubPreview />
      <ArchitectureDiagram />
      <SceneSection />
      <TerminalSection />
      <ServicesGrid />
    </>
  );
}

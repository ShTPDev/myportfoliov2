/**
 * Home page (`/` route).
 *
 * Section order matches the user journey:
 *   Hero → About (who) → Ecosystem (what) → Architecture (how) → Services (offer)
 *
 * Server Component. Children mix server + client — Next handles the boundary.
 */

import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/hero/About";
import { EcosystemShowcase } from "@/components/ecosystem/EcosystemShowcase";
import { ArchitectureDiagram } from "@/components/ecosystem/ArchitectureDiagram";
import { ServicesGrid } from "@/components/ecosystem/ServicesGrid";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <EcosystemShowcase />
      <ArchitectureDiagram />
      <ServicesGrid />
    </>
  );
}

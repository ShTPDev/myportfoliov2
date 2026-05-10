/**
 * ServicesGrid — bento-grid of services with tilt + scroll reveal.
 *
 * Phase 3 layout note:
 *   `BentoCard` MUST stay a direct child of `BentoGrid` so CSS grid spans
 *   apply correctly. So Reveal/TiltCard wrap the *content* of each card,
 *   not the card itself. This keeps the grid layout intact while still
 *   getting scroll fade + 3D hover tilt.
 */

import { Section } from "@/components/ui/Section";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { ServiceCard } from "./ServiceCard";
import { Reveal } from "@/components/animations/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { SERVICES } from "@/data/services";

export function ServicesGrid() {
  return (
    <Section
      id="services"
      eyebrow="Core competencies"
      title="The scope I bring to an IT Manager role."
      description="Operations, infrastructure, full-stack delivery, and payments + security — backed by hands-on experience at BSIF and M3M3 Development."
    >
      <BentoGrid>
        {SERVICES.map((service, i) => (
          <BentoCard
            key={service.title}
            span={i === 0 ? "2x1" : "1x1"}
            className="!p-0"
          >
            <Reveal delay={i * 0.08} className="h-full">
              <TiltCard className="h-full">
                <div className="flex h-full flex-col p-6">
                  <ServiceCard service={service} />
                </div>
              </TiltCard>
            </Reveal>
          </BentoCard>
        ))}
      </BentoGrid>
    </Section>
  );
}

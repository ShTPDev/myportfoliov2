/**
 * ServicesGrid — bento-grid of services on the homepage.
 *
 * Demonstrates BentoCard `span` prop driving asymmetric layout:
 *  - First card spans 2 columns (wide).
 *  - Remaining cards default to 1x1.
 *
 * Server Component (data is local + static).
 */

import { Section } from "@/components/ui/Section";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { ServiceCard } from "./ServiceCard";
import { SERVICES } from "@/data/services";

export function ServicesGrid() {
  return (
    <Section
      id="services"
      eyebrow="What I build"
      title="From mobile apps to payment rails."
      description="I work across the stack so the architecture stays coherent."
    >
      <BentoGrid>
        {SERVICES.map((service, i) => (
          <BentoCard
            key={service.title}
            // First tile takes a wider slot to anchor the grid visually.
            span={i === 0 ? "2x1" : "1x1"}
          >
            <ServiceCard service={service} />
          </BentoCard>
        ))}
      </BentoGrid>
    </Section>
  );
}

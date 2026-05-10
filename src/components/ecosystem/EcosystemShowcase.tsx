/**
 * EcosystemShowcase — main section displaying all M3 products.
 *
 * Layout: 2-column grid on md+, stacked on mobile. Each card uses Reveal +
 * TiltCard for scroll-in + 3D hover.
 *
 * Server component (no hooks). Children are client components.
 */

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animations/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { EcosystemCard } from "./EcosystemCard";
import { ECOSYSTEM } from "@/data/ecosystem";

export function EcosystemShowcase() {
  return (
    <Section
      id="ecosystem"
      eyebrow="The M3 ecosystem"
      title="Four products, one architecture."
      description="Customer app, driver app, admin dashboard, and payment rails — built to share models, auth, and infrastructure."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {ECOSYSTEM.map((entry, i) => (
          <Reveal key={entry.kind} delay={(i % 2) * 0.08} className="h-full">
            <TiltCard className="h-full" max={4}>
              <article className="glass flex h-full flex-col rounded-2xl p-6 transition hover:bg-white/10">
                <EcosystemCard entry={entry} />
              </article>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

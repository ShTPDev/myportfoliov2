/**
 * EcosystemShowcase — section listing the four flagship production projects.
 *
 * Data-driven: pulls from `ECOSYSTEM` in `@/data/ecosystem`. Update the data
 * file to add/remove cards — this component never needs to change.
 *
 * Layout: 2-column grid on md+, stacked on mobile. Each card uses Reveal +
 * TiltCard for scroll-in + 3D hover.
 *
 * Server component (no hooks). Children include client components — Next.js
 * stitches the boundary automatically.
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
      eyebrow="Selected work"
      title="Four production systems."
      description="From a 287K-LOC marketplace on Google Cloud to a sports-betting platform and an internal government IT system — all shipped end-to-end."
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

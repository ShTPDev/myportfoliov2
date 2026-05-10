/**
 * EcosystemShowcase — section listing the four flagship production projects.
 *
 * Data-driven: pulls from `ECOSYSTEM` in `@/data/ecosystem`. Update the data
 * file to add/remove cards — this component never needs to change.
 *
 * Layout: 2-column grid on md+, stacked on mobile. Each card uses Reveal +
 * SpotlightCard for scroll-in + a Linear-style "shared cursor spotlight"
 * hover. SpotlightGrid wraps the grid and broadcasts cursor coordinates to
 * every card via CSS custom properties — see SpotlightCard.tsx for the why.
 *
 * Server component (no hooks). Children include client components — Next.js
 * stitches the boundary automatically at the `"use client"` line in those
 * files.
 */

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animations/Reveal";
import {
  SpotlightCard,
  SpotlightGrid,
} from "@/components/ui/SpotlightCard";
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
      {/*
        SpotlightGrid is the *single* mousemove listener for the whole grid.
        It writes `--mx` / `--my` CSS variables on itself; CSS cascade does
        the rest, so every SpotlightCard inside reads the same coordinates
        and the spotlight feels like one shared light source.
      */}
      <SpotlightGrid className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {ECOSYSTEM.map((entry, i) => (
          <Reveal key={entry.kind} delay={(i % 2) * 0.08} className="h-full">
            <SpotlightCard className="h-full">
              {/*
                The article element is the semantic wrapper for one project.
                SpotlightCard already supplies `glass rounded-2xl` and the
                hover background lift, so the inner article only needs
                padding + flex layout — no double background or border.
              */}
              <article className="flex h-full flex-col p-6">
                <EcosystemCard entry={entry} />
              </article>
            </SpotlightCard>
          </Reveal>
        ))}
      </SpotlightGrid>
    </Section>
  );
}

/**
 * ServiceCard — single offering tile rendered inside a BentoCard.
 */

import type { Service } from "@/data/services";

export function ServiceCard({ service }: { service: Service }) {
  // Capitalize the local name so JSX accepts it as a component (lowercase
  // tags are treated as native HTML elements). Convention in React.
  const Icon = service.icon;
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-violet/15 text-accent-violet ring-1 ring-accent-violet/30">
        <Icon size={18} />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
      <p className="mt-2 text-sm text-foreground-muted">{service.blurb}</p>
    </div>
  );
}

/**
 * TerminalSection — wraps the Terminal in a Section with copy.
 */

import { Section } from "@/components/ui/Section";
import { Terminal } from "./Terminal";

export function TerminalSection() {
  return (
    <Section
      id="terminal"
      eyebrow="CLI"
      title="Operate the platform from a single line."
      description="The same tools I use to inspect production systems — wrapped in a tiny demo."
    >
      <Terminal />
    </Section>
  );
}

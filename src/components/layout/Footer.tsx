/**
 * Footer — appears at the bottom of every page.
 *
 * Server Component. `new Date().getFullYear()` runs on the server at request
 * time (or build time for static pages), so the year is baked into the HTML
 * — no client JS needed.
 *
 * Socials row sourced from the typed `SOCIALS` constant.
 *
 * Note on icons: lucide-react v1.x removed brand-name icons (Github,
 * Linkedin, etc.) for trademark reasons. We render text labels with a
 * generic `ExternalLink` glyph instead — accessible and brand-agnostic.
 */

// `SITE` and `SOCIALS` come from src/lib/constants.ts and are typed via
// `as const`, so each URL is a string-literal type, not just `string`. That
// gives autocomplete and prevents typos at the call site.
import { SITE, SOCIALS } from "@/lib/constants";
// `lucide-react` is a tree-shakeable icon library — only the icon we use
// ships in the bundle.
import { ExternalLink } from "lucide-react";

/**
 * Local type describing one social link. `Readonly<...>` would also work;
 * this verbose form keeps the fields obvious to a TS beginner.
 */
type SocialLink = {
  href: string;
  label: string;
};

// Building the list in code (rather than embedding three near-identical <a>
// tags) keeps the JSX below to one `.map`.
const socialLinks: ReadonlyArray<SocialLink> = [
  { href: SOCIALS.github, label: "GitHub" },
  { href: SOCIALS.linkedin, label: "LinkedIn" },
  { href: SOCIALS.company, label: "m3m3development.com" },
];

export function Footer() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-6xl px-6 pb-10 pt-12 text-sm text-foreground-muted">
      <div className="glass flex flex-col items-center justify-between gap-4 rounded-2xl px-6 py-5 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {SITE.author}
        </span>

        {/*
          Socials row. `target="_blank"` opens in a new tab; `rel="noreferrer"`
          is a small security/perf precaution for outbound links — it stops
          the new page from reaching back into this one via `window.opener`.
        */}
        <nav aria-label="Social links" className="flex items-center gap-4">
          {socialLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <span>{label}</span>
              {/* `aria-hidden` keeps the decorative arrow out of screen-reader output. */}
              <ExternalLink aria-hidden="true" className="h-3 w-3" />
            </a>
          ))}
        </nav>

        <span className="font-mono text-xs">
          built with Next.js · TypeScript · Tailwind
        </span>
      </div>
    </footer>
  );
}

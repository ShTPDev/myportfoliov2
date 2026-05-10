/**
 * /contact — direct contact details + a working contact form.
 *
 * Why this page exists:
 *  - Recruiters and founders land here to reach the owner directly. The form
 *    is a backup channel; the page leads with email/phone/location so people
 *    can copy them or tap a `mailto:` / `tel:` link instantly.
 *
 * Server vs Client (App Router concept):
 *  - This file is a Server Component by default. It renders to HTML on the
 *    server, so there's no JS bundle cost for the static parts (header,
 *    contact rows, social links).
 *  - The form has interactive state (typing, submitting, success/error UI),
 *    so it lives in its own file marked `"use client"`. The server page
 *    *imports* it; Next.js handles the boundary automatically.
 *  - Mental model: keep as much as possible on the server, push the
 *    `"use client"` line as deep into the tree as you can.
 *
 * Concepts demonstrated:
 *  - `export const metadata` — page-level <title> override (Next App Router).
 *  - Importing a client component from a server component.
 *  - `mailto:` / `tel:` URI schemes — the browser handles them natively.
 *
 * Docs reference:
 *   node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
 *   node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
 */

import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/projects/ContactForm";
import { SITE, SOCIALS } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

/**
 * Per-page metadata. Next merges this with the root metadata in
 * `src/app/layout.tsx` — the title here becomes "Contact | <site title>"
 * (or whatever template the root sets).
 */
export const metadata = {
  title: "Contact",
};

/**
 * One direct-contact row. Typing this list explicitly makes it easy to add
 * new rows later without re-deriving the shape.
 *
 * `LucideIcon` is the type of any lucide-react icon component. Storing the
 * component itself (not a JSX element) lets us render it differently per row
 * with a `<Icon />` tag below.
 */
type ContactRow = {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
};

const contactRows: ReadonlyArray<ContactRow> = [
  {
    icon: Mail,
    label: "Email",
    value: SITE.email,
    // `mailto:` is a URI scheme the browser hands off to the user's mail app.
    href: `mailto:${SITE.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: SITE.phone,
    // `tel:` opens the dialer on mobile, or a softphone on desktop if one
    // is registered. Spaces and dashes are fine; some clients prefer `+`-
    // prefixed E.164 — `+501-625-0795` works either way.
    href: `tel:${SITE.phone.replace(/\s+/g, "")}`,
  },
  {
    icon: MapPin,
    label: "Location",
    value: SITE.location,
    // Google Maps deep link — opens the map app on mobile.
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      SITE.location,
    )}`,
  },
];

/**
 * Social links rendered as a sub-row beneath the direct-contact rows.
 * Note: lucide-react v1.x removed brand glyphs (Github, Linkedin) for
 * trademark reasons — we use the generic `ExternalLink` icon and rely on
 * the text label for identification, matching the Footer convention.
 */
const socialLinks: ReadonlyArray<{ href: string; label: string }> = [
  { href: SOCIALS.github, label: "GitHub" },
  { href: SOCIALS.linkedin, label: "LinkedIn" },
  { href: SOCIALS.company, label: "m3m3development.com" },
];

export default function ContactPage(): React.JSX.Element {
  return (
    <Section
      eyebrow="Contact"
      title="Let's talk."
      description="Open to IT Manager roles in Belize. Hiring teams, recruiters, founders — reach me directly or via the form."
    >
      {/*
        Two-column grid: stacks on mobile, splits 1:1 from `md` (≥768px) up.
        `gap-8` controls both row gap (mobile) and column gap (desktop).
      */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* ---------- LEFT: direct contact details ---------- */}
        <div className="flex flex-col gap-4">
          {contactRows.map(({ icon: Icon, label, value, href }) => (
            // Each row is a "glass" card — the `.glass` utility is defined in
            // globals.css (translucent bg + backdrop-blur). `group` enables
            // child hover styles via `group-hover:*`.
            <a
              key={label}
              href={href}
              className="glass group flex items-center gap-4 rounded-2xl px-5 py-4 transition-colors hover:ring-1 hover:ring-accent-cyan/40"
            >
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-cyan/10 text-accent-cyan ring-1 ring-accent-cyan/20">
                <Icon size={18} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
                  {label}
                </span>
                <span className="text-sm text-foreground transition-colors group-hover:text-accent-cyan sm:text-base">
                  {value}
                </span>
              </div>
            </a>
          ))}

          {/*
            Socials sub-row — text links with a small ExternalLink glyph.
            Mirrors the Footer treatment so the visual language is consistent
            across the site.
          */}
          <nav
            aria-label="Social links"
            className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-sm text-foreground-muted"
          >
            {socialLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                // `rel="noreferrer"` blocks the new tab from reaching back
                // into ours via `window.opener`. Standard outbound-link hygiene.
                rel="noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                <span>{label}</span>
                <ExternalLink aria-hidden="true" className="h-3 w-3" />
              </a>
            ))}
          </nav>
        </div>

        {/* ---------- RIGHT: interactive contact form (client component) ---------- */}
        <ContactForm />
      </div>
    </Section>
  );
}

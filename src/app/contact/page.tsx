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
 *    contact rows, social links, calendar embed placeholder).
 *  - The form has interactive state (typing, submitting, success/error UI),
 *    so it lives in its own file marked `"use client"`. Same for the small
 *    `CopyButton` (it touches `navigator.clipboard`). The server page
 *    *imports* them; Next.js handles the boundary automatically.
 *  - Mental model: keep as much as possible on the server, push the
 *    `"use client"` line as deep into the tree as you can.
 *
 * Concepts demonstrated:
 *  - `export const metadata` — page-level <title> override (Next App Router).
 *  - Importing a client component (CopyButton, ContactForm) from a server
 *    component — Next.js inserts the boundary and ships only the client
 *    component's JS to the browser.
 *  - `mailto:` / `tel:` URI schemes — the browser hands these to the user's
 *    mail/dialer app natively.
 *
 * Docs reference:
 *   node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
 *   node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
 */

import { Mail, Phone, MapPin, ExternalLink, Clock } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/projects/ContactForm";
import { ResumeButton } from "@/components/layout/ResumeButton";
import { CopyButton } from "@/components/contact/CopyButton";
import { CalendarEmbed } from "@/components/contact/CalendarEmbed";
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
 *
 * `copyValue` is optional — `MapPin` (location) doesn't need a copy button
 * since the row links to a map. Email and phone do.
 */
type ContactRow = {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  copyValue?: string;
};

const contactRows: ReadonlyArray<ContactRow> = [
  {
    icon: Mail,
    label: "Email",
    value: SITE.email,
    // `mailto:` is a URI scheme the browser hands off to the user's mail app.
    href: `mailto:${SITE.email}`,
    copyValue: SITE.email,
  },
  {
    icon: Phone,
    label: "Phone",
    value: SITE.phone,
    // `tel:` opens the dialer on mobile, or a softphone on desktop if one
    // is registered. Spaces and dashes are fine; some clients prefer `+`-
    // prefixed E.164 — `+501-625-0795` works either way.
    href: `tel:${SITE.phone.replace(/\s+/g, "")}`,
    copyValue: SITE.phone,
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
      description="Open to IT Manager and Software Engineering roles in Belize. Available May 2026 — open to roles starting now. Hiring teams, recruiters, founders — reach me directly or via the form."
    >
      {/*
        ── Response-time + availability badge ──
        Sits above the two-column grid so it's the first thing eyes land on
        after the page header. Glass pill, monospace small caps for the
        "label" feel, with a clock icon. Single source of truth for the
        promise we're making to recruiters.

        Why a `<div>` not a `<p>`? It contains an inline icon plus a span,
        and the dot separators read fine as plain text — `<p>` would also
        work; a div keeps it semantically a "badge" rather than a paragraph.
      */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-foreground-muted">
          <Clock size={12} aria-hidden="true" className="text-accent-cyan" />
          <span>I respond within 24h</span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span>Belmopan, Belize</span>
          <span aria-hidden="true" className="opacity-40">·</span>
          {/* CST = Central Standard Time. Belize doesn't observe DST → year-round CST. */}
          <span>CST (no DST)</span>
        </span>
      </div>

      {/*
        Two-column grid: stacks on mobile, splits 1:1 from `md` (≥768px) up.
        `gap-8` controls both row gap (mobile) and column gap (desktop).
      */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* ---------- LEFT: direct contact details ---------- */}
        <div className="flex flex-col gap-4">
          {contactRows.map(({ icon: Icon, label, value, href, copyValue }) => (
            // Each row is a "glass" card. We split the inner layout so the
            // primary `<a>` (mailto/tel/map) wraps only the icon + text, and
            // the `CopyButton` lives as a SIBLING — never a descendant of
            // the `<a>`. (Nesting interactive controls inside an anchor is
            // invalid HTML and breaks keyboard navigation.)
            <div
              key={label}
              className="glass group flex items-center gap-4 rounded-2xl px-5 py-4 transition-colors hover:ring-1 hover:ring-accent-cyan/40"
            >
              <a
                href={href}
                className="flex flex-1 items-center gap-4 outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan rounded-lg"
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
              {/*
                Copy button — only rendered for rows that opt in (email,
                phone). Sibling of the `<a>`, not a child, so it doesn't
                trigger navigation when clicked.
              */}
              {copyValue && (
                <CopyButton value={copyValue} label={`Copy ${label.toLowerCase()}`} />
              )}
            </div>
          ))}

          {/*
            Résumé download — sits between the contact rows and the social
            links. `md` size to match the visual weight of the contact rows
            above it (those are full-width glass cards, not tiny pills).
          */}
          <div className="mt-2">
            <ResumeButton size="md" />
          </div>

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

        {/* ---------- RIGHT: calendar embed + interactive contact form ---------- */}
        <div className="flex flex-col gap-6">
          {/*
            Cal.com booking placeholder — sits ABOVE the form on the right
            column. Server component (no JS shipped), pure styled link card.
            Owner replaces the URL inside CalendarEmbed.tsx when the booking
            page is set up.
          */}
          <CalendarEmbed />
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}

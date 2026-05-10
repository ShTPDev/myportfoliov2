/**
 * seo.ts — base `Metadata` + `Viewport` exports + JSON-LD helper.
 *
 * Next.js App Router reads `export const metadata` AND `export const viewport`
 * from layouts/pages. The `Viewport` export is the right place for theme-color
 * and viewport scaling — these are split out from `Metadata` in Next 14+.
 *
 * Docs: node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
 */

import type { Metadata, Viewport } from "next";
import { SITE, SOCIALS } from "./constants";

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s — ${SITE.name}` },
  description: SITE.description,
  authors: [{ name: SITE.author, url: SOCIALS.linkedin }],
  keywords: [
    "Shamar Patnett",
    "IT Manager Belize",
    "Software Engineer Belize",
    "Full-stack engineer Belize",
    "Belize software developer",
    "marketplace platform",
    "Belize Bank payment gateway",
    "Stripe integration",
    "PayPal integration",
    "Flutter Serverpod",
    "Dart engineer",
    "Systems Administrator",
    "BSIF",
    "M3M3 Development",
    "BeliBet",
  ],
  openGraph: {
    type: "website",
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "en_BZ",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const baseViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050816" },
    { media: "(prefers-color-scheme: light)", color: "#050816" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * JSON-LD structured data for search engines (schema.org Person).
 * Returned as a plain object; embed via `<script type="application/ld+json">`.
 */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.author,
    url: SITE.url,
    image: `${SITE.url}/profile.jpg`,
    jobTitle: SITE.role,
    email: `mailto:${SITE.email}`,
    telephone: SITE.phone,
    description: SITE.description,
    sameAs: [SOCIALS.github, SOCIALS.linkedin, SOCIALS.company],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Belmopan",
      addressRegion: "Cayo",
      addressCountry: "BZ",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Edinburgh Napier University",
    },
    worksFor: {
      "@type": "Organization",
      name: "Belize Social Investment Fund",
    },
    knowsAbout: [
      "IT Management",
      "Systems Administration",
      "Cybersecurity",
      "Flutter",
      "Serverpod",
      "Dart",
      "PostgreSQL",
      "Google Cloud Platform",
      "Payment Integrations",
      "Belize Bank API",
      "SQL Server",
      "Network Architecture",
    ],
  };
}

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
import { SITE } from "./constants";

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s — ${SITE.name}` },
  description: SITE.description,
  authors: [{ name: SITE.author }],
  keywords: [
    "Belize software developer",
    "marketplace",
    "payment integration",
    "e-commerce Belize",
    "mobile app development",
    "full stack systems",
    "Flutter",
    "Serverpod",
  ],
  openGraph: {
    type: "website",
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
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
 * JSON-LD structured data for search engines (schema.org Person/Website).
 * Returned as a plain object; embed via `<script type="application/ld+json">`.
 */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.author,
    url: SITE.url,
    jobTitle: "Full-stack Software Engineer",
    description: SITE.description,
    address: { "@type": "PostalAddress", addressCountry: "BZ" },
    knowsAbout: [
      "Flutter",
      "Serverpod",
      "TypeScript",
      "Next.js",
      "PostgreSQL",
      "Payment integrations",
    ],
  };
}

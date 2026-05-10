/**
 * seo.ts — base `Metadata` object exported by the root layout.
 *
 * In the Next.js App Router, every layout/page can `export const metadata`
 * (or `export async function generateMetadata`). Next reads it at build/render
 * time and emits the right <title>, <meta>, OpenGraph, Twitter, robots tags
 * into the document <head>. We never touch <head> manually.
 *
 * Docs: node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
 */

import type { Metadata } from "next";
import { SITE } from "./constants";

// `Metadata` is the shape Next.js expects. Annotating it gives full
// autocomplete + catches typos like `openGrap`.
export const baseMetadata: Metadata = {
  // `metadataBase` resolves all relative URLs in OG/Twitter images.
  metadataBase: new URL(SITE.url),

  // `title` can be a string OR an object with `default` + `template`.
  // The template is used by child pages: `export const metadata = { title: "Projects" }`
  // becomes "Projects — M3 / Portfolio" automatically.
  title: { default: SITE.title, template: `%s — ${SITE.name}` },

  description: SITE.description,
  authors: [{ name: SITE.author }],

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

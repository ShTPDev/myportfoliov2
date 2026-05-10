/**
 * sitemap.ts — Next.js generates /sitemap.xml from this default export.
 *
 * Special file convention: when present at `src/app/sitemap.ts`, Next.js
 * serves the result as `/sitemap.xml`. The `MetadataRoute.Sitemap` type
 * gives autocomplete on `changeFrequency`, etc.
 *
 * Docs: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md
 */

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/projects", "/services", "/about-me", "/contact"];
  return routes.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "monthly" : "yearly",
    priority: path === "" ? 1 : 0.7,
  }));
}

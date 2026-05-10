/**
 * robots.ts — Next.js generates /robots.txt from this default export.
 *
 * Special file convention. Returns a `MetadataRoute.Robots` object.
 *
 * Docs: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md
 */

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

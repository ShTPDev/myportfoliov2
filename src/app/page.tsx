/**
 * Home page (`/` route).
 *
 * In the App Router, ANY `page.tsx` file inside `src/app/` becomes a route.
 * `src/app/page.tsx` → `/`. `src/app/projects/page.tsx` → `/projects`. Etc.
 *
 * This is a Server Component (no `"use client"`). It composes client
 * components (like <Hero />, which DOES use `"use client"` because it animates).
 * Mixing server + client components is fine — Next handles the boundary.
 */

import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/hero/About";
import { ServicesGrid } from "@/components/ecosystem/ServicesGrid";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <ServicesGrid />
    </>
  );
}

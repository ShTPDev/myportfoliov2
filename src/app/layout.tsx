/**
 * Root layout — wraps EVERY page in the app.
 *
 * Next.js App Router rules:
 *  - This file is REQUIRED at `src/app/layout.tsx` and must render <html> and <body>.
 *  - It's a Server Component by default (no `"use client"` here). Server
 *    components run on the server, can read filesystem/env, and ship ZERO JS
 *    to the browser unless they include client components as children.
 *  - `export const metadata` is read by Next.js to populate <head>.
 *  - The `children` prop is whatever page/nested layout is currently rendered.
 *
 * Composition pattern:
 *  - <ThemeProvider /> is a client component (needs Context + localStorage).
 *  - We wrap content in it once here so every page gets dark-mode support
 *    without re-mounting the provider on navigation.
 *
 * Docs: node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
 */

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { baseMetadata } from "@/lib/seo";

// `next/font` self-hosts Google fonts at build time (no FOUT, no extra request).
// Each call returns an object with a `.variable` CSS variable name we attach
// to <html>; Tailwind v4 references `--font-geist-sans` via @theme.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Re-export the metadata defined in lib/seo so Next picks it up here.
export const metadata = baseMetadata;

/**
 * `Readonly<T>` is a TS utility type that makes every property of T readonly.
 * Here it signals "the layout will not mutate its props" — purely a hint for
 * other devs (and for our own future selves), not a runtime guarantee.
 *
 * `React.ReactNode` is the broadest type for "anything renderable" — JSX,
 * strings, numbers, arrays of these, null, etc.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // Suppresses harmless mismatch warnings when next-themes injects a
      // `class` on <html> client-side after hydration.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Navbar />
          {/* `flex-1` lets <main> grow to fill the viewport, pushing footer down. */}
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

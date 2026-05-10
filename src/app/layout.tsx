/**
 * Root layout — wraps EVERY page in the app.
 *
 * Phase 6 additions:
 *  - `viewport` export (split from `metadata` in Next 14+).
 *  - JSON-LD <script> for Person/Website schema (SEO rich results).
 *  - Skip-to-content link (a11y for keyboard users).
 *  - ScrollProgress bar at top.
 *
 * Docs: node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
 */

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
// CommandPalette is a client component mounted ONCE here at the root so
// the ⌘K shortcut works on every page. Mounting per-page would either
// duplicate listeners or miss routes that forget to include it.
import { CommandPalette } from "@/components/layout/CommandPalette";
import { baseMetadata, baseViewport, personJsonLd } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = baseMetadata;
export const viewport = baseViewport;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Keyboard-only skip link — visible on focus, hidden otherwise. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:text-background"
        >
          Skip to content
        </a>

        {/* JSON-LD: search engines parse this for rich-result eligibility. */}
        <script
          type="application/ld+json"
          // dangerouslySetInnerHTML is the standard way to inject raw JSON-LD.
          // Safe here: content is from our own typed data, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />

        <ThemeProvider>
          <ScrollProgress />
          <Navbar />
          <main id="main" className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          {/*
            Mounted once for the whole app. The component itself is empty
            DOM until the user opens it (⌘K, Ctrl+K, or the navbar button),
            at which point it renders its modal via AnimatePresence.
          */}
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}

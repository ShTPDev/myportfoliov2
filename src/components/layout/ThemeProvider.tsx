/**
 * ThemeProvider — wraps the app with next-themes.
 *
 * Why a separate file?
 *   `next-themes` uses React Context + browser localStorage, which means it
 *   *must* run on the client. The root layout (layout.tsx) is a Server
 *   Component, so we can't put `<ThemeProvider>` directly there. Instead we
 *   wrap it once in this client component and import the wrapper in layout.
 *
 * Pattern: "client-only context provider mounted from a server layout".
 *
 * Concept showcase:
 *  - `"use client"` directive marks this whole file as client-rendered.
 *  - `ComponentProps<typeof X>` — TS utility that grabs the prop type of
 *    another component. Lets us forward props without retyping them.
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// `ComponentProps<typeof NextThemesProvider>` = "the same props NextThemesProvider accepts".
// We add no props of our own — just pass through.
type Props = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      // `disableTransitionOnChange` prevents jarring color flashes when the
      // theme attribute flips on <html>.
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

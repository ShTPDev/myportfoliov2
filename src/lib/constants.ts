/**
 * constants.ts — site-wide static values.
 *
 * Concept showcase:
 *  - `as const` assertion → makes the object *deeply readonly* and narrows
 *    string types from `string` to their literal value. Very useful for
 *    config that should never mutate.
 *
 *      const x = { name: "M3" };           // type: { name: string }
 *      const y = { name: "M3" } as const;  // type: { readonly name: "M3" }
 *
 *    The literal-narrowing means TS will autocomplete `SITE.name` as the
 *    exact string "M3 / Portfolio" wherever you use it.
 */

export const SITE = {
  name: "M3 / Portfolio",
  url: "https://example.com",
  title: "Belize Software Developer — Marketplace, Payments, Systems",
  description:
    "Full-stack engineer building Belize-focused commerce: marketplaces, payment integrations, and runner logistics.",
  author: "ShTPDev",
} as const;

/**
 * Navigation links rendered by the Navbar. `as const` on the array gives us
 * a tuple of literal-typed objects, which lets TS catch typos when we
 * `Link href={...}` somewhere expecting a SITE route.
 */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

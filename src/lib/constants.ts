/**
 * constants.ts — site-wide static values.
 *
 * Real owner data sourced from CV/resume (May 2026 IT Manager application).
 *
 * `as const` makes the object deeply readonly and narrows literal types so
 * autocomplete shows the exact strings, not just `string`.
 */

export const SITE = {
  name: "Shamar T. Patnett",
  shortName: "STP",
  url: "https://m3m3development.com",
  title: "Shamar T. Patnett — IT Manager · Full-Stack Engineer · Belize",
  description:
    "IT Manager candidate, founder of M3M3 Development, sole IT authority at BSIF. Full-stack engineer who shipped a live 287K-LOC marketplace with Belize Bank payment integration in production.",
  author: "Shamar T. Patnett",
  role: "Information Technology Manager",
  location: "Belmopan, Belize",
  email: "Shamarpatnett2000@gmail.com",
  phone: "+501-625-0795",
} as const;

export const SOCIALS = {
  github: "https://github.com/ShTPDev",
  linkedin: "https://www.linkedin.com/in/shamar-patnett-a529301b6/",
  company: "https://m3m3development.com",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Headline metrics for the Stats section. Each entry has a numeric+label
 * pair; UI may animate the numeric.
 */
export const STATS = [
  { value: "5+", label: "Years progressive IT experience" },
  { value: "287K", label: "Lines of production code shipped" },
  { value: "4+", label: "Years leading dev team" },
  { value: "4", label: "Payment providers integrated" },
] as const;

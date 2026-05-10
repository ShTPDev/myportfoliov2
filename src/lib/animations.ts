/**
 * animations.ts — reusable Framer Motion `Variants` objects.
 *
 * Mental model for Framer Motion:
 *  - A *variant* is a named animation state (e.g. "hidden", "show").
 *  - A `Variants` object is a map: { stateName: styleAtThatState }.
 *  - Components flip between variants via `initial`, `animate`, `whileInView`.
 *  - When a parent uses `variants` + `initial`/`animate`, children inherit the
 *    same state names automatically (drives staggered animations).
 *
 * Why centralize them here? So motion timings/easings stay consistent across
 * the whole site instead of being copy-pasted into every component.
 */

import type { Variants } from "framer-motion";

// `Variants` is a TypeScript type imported from framer-motion. Annotating the
// constant tells TS "this object must conform to the Variants shape" — you
// get autocomplete on `transition`, `opacity`, `y`, etc.
export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    // Custom cubic-bezier easing — feels snappier than the default "easeOut".
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * `stagger` is a *parent* variant: it has no visible animation itself, but it
 * tells Framer Motion to ripple the "show" state down to children with a
 * 0.08s delay between each. Use it on a wrapper that contains motion children
 * also bound to fadeIn / fadeInUp.
 */
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

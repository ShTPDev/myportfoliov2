/**
 * FadeIn — drop-in wrapper that fades content in when scrolled into view.
 *
 * Usage:
 *   <FadeIn className="...">
 *     <p>Some content</p>
 *   </FadeIn>
 *
 * Concept showcase:
 *  - Re-exporting a typed component that forwards ALL motion.div props.
 *  - `HTMLMotionProps<"div">` is Framer Motion's type for "all props a
 *    motion.div accepts" (className, children, style, variants, plus the
 *    HTML <div> attributes). Spreading `{...props}` passes them through.
 *  - `whileInView` triggers `show` when the element scrolls into the viewport.
 *  - `viewport={{ once: true, amount: 0.2 }}` — fire only once, when 20% of
 *    the element is visible. Without `once`, it would replay on every scroll.
 */

"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeIn } from "@/lib/animations";

export function FadeIn(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    />
  );
}

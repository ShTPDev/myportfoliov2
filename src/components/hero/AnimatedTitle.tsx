/**
 * AnimatedTitle — splits a string into words and animates each one in.
 *
 * Concept showcase:
 *  - **Per-word stagger** — split, map, render each word as a motion.span.
 *  - **`React.Children` is unnecessary here** — string input, simpler.
 *  - **`whitespace-pre`** — preserve spaces between word spans.
 */

"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const wordVariants: Variants = {
  hidden: { opacity: 0, y: "0.6em" },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

export function AnimatedTitle({
  text,
  className,
  highlight,
}: {
  text: string;
  className?: string;
  // Optional substring rendered with the gradient class.
  highlight?: string;
}) {
  const words = text.split(" ");
  return (
    <motion.h1
      variants={containerVariants}
      initial="hidden"
      animate="show"
      // overflow-hidden clips the y-translate of word spans for a slot-machine reveal.
      className={className}
    >
      {words.map((w, i) => {
        const isHighlight = !!highlight && w.includes(highlight);
        return (
          <span
            key={i}
            className="inline-block overflow-hidden align-bottom"
          >
            <motion.span
              variants={wordVariants}
              className={
                isHighlight
                  ? "text-gradient inline-block whitespace-pre"
                  : "inline-block whitespace-pre"
              }
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        );
      })}
    </motion.h1>
  );
}

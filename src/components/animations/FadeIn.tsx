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

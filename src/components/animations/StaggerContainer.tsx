"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { stagger } from "@/lib/animations";

export function StaggerContainer(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    />
  );
}

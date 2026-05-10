/**
 * StaggerContainer — wrapper that staggers its motion children on scroll-in.
 *
 * Pair with motion children using `fadeIn` / `fadeInUp` variants:
 *
 *   <StaggerContainer>
 *     <motion.div variants={fadeInUp}>One</motion.div>
 *     <motion.div variants={fadeInUp}>Two</motion.div>
 *   </StaggerContainer>
 *
 * The parent's `stagger` variant has a `staggerChildren` transition, so each
 * child animates 0.08s after the previous one — no per-child delay math.
 */

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

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT, pageTransition } from "@/lib/motion/presets";

export default function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}

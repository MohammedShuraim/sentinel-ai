"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion/presets";
import { cn } from "@/lib/utils/cn";

interface ConfidenceBarProps {
  /** 0–100 */
  value: number;
  className?: string;
}

/** Animated AI-confidence meter with the deep-red brand gradient. */
export function ConfidenceBar({ value, className }: ConfidenceBarProps) {
  const reduceMotion = useReducedMotion();
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-elevated",
        className,
      )}
      role="presentation"
    >
      <motion.div
        initial={reduceMotion ? false : { width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
        className="h-full rounded-full bg-gradient-to-r from-ai-strong via-ai to-brand"
      />
    </div>
  );
}

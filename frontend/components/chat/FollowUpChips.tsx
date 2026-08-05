"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";

interface FollowUpChipsProps {
  suggestions: string[];
  disabled: boolean;
  onSelect: (suggestion: string) => void;
}

export const FollowUpChips = memo(function FollowUpChips({
  suggestions,
  disabled,
  onSelect,
}: FollowUpChipsProps) {
  const reduceMotion = useReducedMotion();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-wrap items-center gap-2 pl-11"
      role="group"
      aria-label="Suggested follow-up questions"
    >
      {suggestions.map((suggestion) => (
        <motion.button
          key={suggestion}
          variants={reduceMotion ? undefined : fadeUp}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(suggestion)}
          className="rounded-full border border-ai/25 bg-ai-soft px-3.5 py-1.5 text-xs font-medium text-ai transition-[border-color,color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-ai/50 hover:shadow-[0_0_14px_rgb(214_40_40/0.18)] hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai/50 active:scale-[0.97] disabled:opacity-50"
        >
          {suggestion}
        </motion.button>
      ))}
    </motion.div>
  );
});

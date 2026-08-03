"use client";

import { motion } from "framer-motion";
import { SparkIcon } from "@/components/common/icons";

export function TypingIndicator() {
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-3"
      aria-label="The AI analyst is thinking"
    >
      <span className="relative grid h-8 w-8 shrink-0 place-items-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-lg bg-ai/30 motion-safe:animate-ping"
        />
        <span
          aria-hidden
          className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-ai-strong to-ai text-ai-ink"
        >
          <SparkIcon className="h-4 w-4" />
        </span>
      </span>

      <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-md border border-line/70 bg-surface/70 px-4 py-3 backdrop-blur-md">
        <span className="flex items-center gap-1" aria-hidden>
          {[0, 0.15, 0.3].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 rounded-full bg-ai motion-safe:animate-typing"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </span>
        <span className="text-sm text-fg-muted motion-safe:animate-pulse-soft">
          Thinking…
        </span>
      </div>
    </motion.li>
  );
}

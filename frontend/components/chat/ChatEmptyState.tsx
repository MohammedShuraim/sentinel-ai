"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";
import { SparkIcon } from "@/components/common/icons";

const EXAMPLE_PROMPTS = [
  "Analyze Reliance Industries for long-term investment",
  "Review my portfolio and suggest improvements",
  "Explain why my top recommendation fits my profile",
  "What's the latest market news on Indian banks?",
];

const QUICK_LINKS = [
  { href: "/stocks", label: "Browse Stocks" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/portfolio", label: "Portfolio" },
];

export function ChatEmptyState({
  onPrompt,
}: {
  onPrompt: (prompt: string) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="relative flex h-full flex-col items-center justify-center gap-6 text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_32%,rgb(167_139_250/0.07),transparent_70%)]"
      />

      <motion.span
        variants={reduceMotion ? undefined : fadeUp}
        aria-hidden
        className="relative grid place-items-center"
      >
        <span className="absolute h-20 w-20 rounded-full bg-ai/15 blur-xl" />
        <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-ai-strong to-ai text-ai-ink shadow-[0_0_36px_rgb(139_92_246/0.4)] ring-1 ring-ai/40">
          <SparkIcon className="h-7 w-7" />
        </span>
      </motion.span>

      <motion.div
        variants={reduceMotion ? undefined : fadeUp}
        className="relative flex flex-col gap-2"
      >
        <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
          Your AI market analyst
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-fg-muted">
          Analyze any Indian stock, review your portfolio, or understand your
          recommendations — answered with evidence and sources.
        </p>
      </motion.div>

      <motion.div
        variants={reduceMotion ? undefined : fadeUp}
        className="relative flex flex-col items-center gap-2"
      >
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPrompt(prompt)}
            className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-fg-muted transition-[border-color,background-color,color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-ai/40 hover:bg-ai-soft hover:text-ai hover:shadow-[0_0_16px_rgb(139_92_246/0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai/50 active:scale-[0.98]"
          >
            {prompt}
          </button>
        ))}
      </motion.div>

      <motion.div
        variants={reduceMotion ? undefined : fadeUp}
        className="relative flex flex-wrap items-center justify-center gap-2"
      >
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-fg-subtle underline-offset-4 transition-colors hover:text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            {link.label}
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}

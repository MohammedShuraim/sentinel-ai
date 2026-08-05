"use client";

import { memo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { EASE_OUT } from "@/lib/motion/presets";
import { cn } from "@/lib/utils/cn";
import type { RetrievedDocument } from "@/lib/api/types";

function relevancePercent(score: number): number {
  const normalized = score <= 1 ? score * 100 : score;
  return Math.min(100, Math.max(0, Math.round(normalized)));
}

const SourceCard = memo(function SourceCard({
  source,
  index,
}: {
  source: RetrievedDocument;
  index: number;
}) {
  const company = source.company_name ?? source.ticker;
  const label = source.title ?? source.chunk_text;
  const relevance = relevancePercent(source.score);

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: EASE_OUT }}
      className="group rounded-xl border border-line bg-elevated/60 px-3.5 py-3 transition-[border-color,box-shadow] duration-200 hover:border-ai/30 hover:shadow-[0_0_18px_rgb(214_40_40/0.08)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral" className="shrink-0 capitalize">
          {source.source_type.replace(/_/g, " ")}
        </Badge>
        {source.ticker ? (
          <Badge variant="brand" className="tnum shrink-0">
            {source.ticker}
          </Badge>
        ) : null}
        {company && company !== source.ticker ? (
          <span className="min-w-0 truncate text-xs font-medium text-fg">
            {company}
          </span>
        ) : null}
        <span className="tnum ml-auto flex shrink-0 items-center gap-2 text-[11px] text-fg-subtle">
          <span
            aria-hidden
            className="h-1 w-10 overflow-hidden rounded-full bg-elevated"
          >
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${relevance}%` }}
              transition={{ duration: 0.7, delay: index * 0.05 + 0.2, ease: EASE_OUT }}
              className="block h-full rounded-full bg-gradient-to-r from-ai-strong to-brand"
            />
          </span>
          {relevance}% relevant
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-fg-muted">
        {label}
      </p>
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-brand underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
        >
          Open source
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      ) : null}
    </motion.li>
  );
});

export const SourceCards = memo(function SourceCards({
  sources,
}: {
  sources: RetrievedDocument[];
}) {
  const [open, setOpen] = useState(false);

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-widest text-fg-subtle transition-[border-color,color,box-shadow] duration-200 hover:border-ai/40 hover:text-ai hover:shadow-[0_0_12px_rgb(214_40_40/0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai/40 active:scale-[0.97]"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" />
        </svg>
        {sources.length} {sources.length === 1 ? "source" : "sources"}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-90")}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 flex flex-col gap-2 overflow-hidden"
          >
            {sources.map((source, index) => (
              <SourceCard
                key={`${source.source_type}-${source.news_id ?? source.fundamental_id ?? index}`}
                source={source}
                index={index}
              />
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
});

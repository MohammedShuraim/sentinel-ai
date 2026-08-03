"use client";

import { motion, useReducedMotion } from "framer-motion";
import { activePillTransition } from "@/lib/motion/presets";
import { SparkleIcon } from "@/components/common/icons";
import { cn } from "@/lib/utils/cn";
import {
  LABEL_ACCENTS,
  RECOMMENDATION_LABELS,
  type RecommendationLabel,
} from "@/lib/recommendations/scoring";

export type RecommendationFilter =
  | { type: "label"; label: RecommendationLabel }
  | { type: "sector"; sector: string }
  | { type: "highConfidence" }
  | null;

interface RecommendationFiltersProps {
  sectors: string[];
  selected: RecommendationFilter;
  onSelect: (filter: RecommendationFilter) => void;
}

function isSame(a: RecommendationFilter, b: RecommendationFilter): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  if (a.type !== b.type) {
    return false;
  }
  if (a.type === "label" && b.type === "label") {
    return a.label === b.label;
  }
  if (a.type === "sector" && b.type === "sector") {
    return a.sector === b.sector;
  }
  return true;
}

const baseChip =
  "relative rounded-full border px-3.5 py-1.5 text-xs font-medium transition-[background-color,color,border-color,transform,box-shadow] duration-200 hover:-translate-y-px active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai/40";
const idleChip =
  "border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg";
const activeChip =
  "border-transparent text-brand shadow-[0_0_14px_rgb(52_211_153/0.15)]";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(baseChip, active ? activeChip : idleChip)}
    >
      {active ? (
        <motion.span
          layoutId="rec-filter-active-pill"
          transition={activePillTransition(Boolean(reduceMotion))}
          aria-hidden
          className="absolute inset-0 rounded-full border border-brand/50 bg-brand-soft"
        />
      ) : null}
      <span className="relative inline-flex items-center gap-1.5">
        {children}
      </span>
    </button>
  );
}

export function RecommendationFilters({
  sectors,
  selected,
  onSelect,
}: RecommendationFiltersProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter recommendations"
    >
      <Chip active={selected === null} onClick={() => onSelect(null)}>
        All
      </Chip>

      {RECOMMENDATION_LABELS.map((label) => {
        const filter: RecommendationFilter = { type: "label", label };
        const active = isSame(selected, filter);
        return (
          <Chip
            key={label}
            active={active}
            onClick={() => onSelect(active ? null : filter)}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: LABEL_ACCENTS[label] }}
            />
            {label}
          </Chip>
        );
      })}

      <Chip
        active={isSame(selected, { type: "highConfidence" })}
        onClick={() =>
          onSelect(
            isSame(selected, { type: "highConfidence" })
              ? null
              : { type: "highConfidence" },
          )
        }
      >
        <SparkleIcon className="h-3 w-3 text-ai" />
        High Confidence (&gt;80%)
      </Chip>

      {sectors.length > 0 ? (
        <span aria-hidden className="mx-1 h-4 w-px bg-line" />
      ) : null}

      {sectors.map((sector) => {
        const filter: RecommendationFilter = { type: "sector", sector };
        const active = isSame(selected, filter);
        return (
          <Chip
            key={sector}
            active={active}
            onClick={() => onSelect(active ? null : filter)}
          >
            {sector}
          </Chip>
        );
      })}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/common/Spinner";
import { RecommendationSkeleton } from "@/components/recommendations/RecommendationSkeleton";
import { cn } from "@/lib/utils/cn";

export const GENERATION_STAGES = [
  "Saving Investor Profile…",
  "Generating AI Recommendations…",
  "Analyzing Current Market…",
  "Ranking Stocks…",
] as const;

export type GenerationStageIndex = 0 | 1 | 2 | 3;

interface RecommendationGeneratingStateProps {
  stageIndex: GenerationStageIndex;
  /** When false, hide the "Saving Investor Profile" step (normal page loads). */
  includeSaveStep?: boolean;
}

export function RecommendationGeneratingState({
  stageIndex,
  includeSaveStep = true,
}: RecommendationGeneratingStateProps) {
  const visibleStages = includeSaveStep
    ? GENERATION_STAGES
    : GENERATION_STAGES.slice(1);
  const activeLabel = GENERATION_STAGES[stageIndex];
  const visualIndex = includeSaveStep
    ? stageIndex
    : Math.max(0, stageIndex - 1);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-5 py-10 text-center">
        <Spinner className="h-8 w-8 text-brand" />
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-lg font-semibold text-fg">
            {activeLabel}
          </h2>
          <p className="max-w-md text-sm text-fg-muted">
            Building personalized picks from your investor profile. This usually
            takes a few seconds.
          </p>
        </div>

        <ol className="flex w-full max-w-md flex-col gap-2 text-left">
          {visibleStages.map((label, index) => {
            const done = index < visualIndex;
            const active = index === visualIndex;
            return (
              <motion.li
                key={label}
                initial={false}
                animate={{ opacity: done || active ? 1 : 0.45 }}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm",
                  active
                    ? "border-brand/40 bg-brand-soft text-fg"
                    : done
                      ? "border-line bg-elevated/50 text-fg-muted"
                      : "border-transparent text-fg-subtle",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold",
                    active
                      ? "bg-brand text-brand-ink"
                      : done
                        ? "bg-profit/20 text-profit"
                        : "bg-elevated text-fg-subtle",
                  )}
                >
                  {done ? "✓" : index + 1}
                </span>
                <span className={cn(active && "font-medium")}>{label}</span>
                {active ? (
                  <Spinner className="ml-auto h-3.5 w-3.5 text-brand" />
                ) : null}
              </motion.li>
            );
          })}
        </ol>
      </Card>

      <RecommendationSkeleton />
    </div>
  );
}

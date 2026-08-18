"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfidenceBar } from "@/components/common/ConfidenceBar";
import { SparkleIcon } from "@/components/common/icons";
import {
  confidenceForScore,
  labelForScore,
  labelVariant,
} from "@/lib/recommendations/scoring";
import { DEFAULT_AI_INSIGHT } from "@/lib/market/starterContent";
import type { RecommendationItem } from "@/lib/api/types";

interface MarketInsightProps {
  topPick: RecommendationItem | null;
  loading: boolean;
  error: boolean;
}

export function MarketInsight({ topPick, loading, error }: MarketInsightProps) {
  const confidence = topPick ? confidenceForScore(topPick.score) : 72;
  const label = topPick ? labelForScore(topPick.score) : null;

  return (
    <Card variant="glass" className="relative flex h-full flex-col gap-4 overflow-hidden">
      {/* animated accent hairline: AI purple flowing into brand mint */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(214_40_40/0.55),rgb(214_40_40/0.55),transparent)] bg-[size:200%_100%] animate-shimmer"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_100%_at_100%_0%,rgb(214_40_40/0.07),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_0%_100%,rgb(214_40_40/0.05),transparent_60%)]"
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ai-soft text-ai"
          >
            <SparkleIcon className="h-4 w-4" />
          </span>
          <Badge variant="brand" dot>
            Today&apos;s AI insight
          </Badge>
        </div>
        {label ? (
          <Badge variant={labelVariant(label)} className="tnum shrink-0">
            {label}
          </Badge>
        ) : null}
      </div>

      {loading ? (
        <div className="relative flex flex-col gap-3">
          <div className="skeleton h-7 w-48" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-4 w-3/5" />
        </div>
      ) : topPick ? (
        <div className="relative flex flex-1 flex-col gap-3.5">
          <div className="flex items-baseline gap-3">
            <h3 className="tnum font-display text-2xl font-semibold tracking-tight text-fg">
              {topPick.ticker}
            </h3>
            <p className="truncate text-sm text-fg-muted">
              {topPick.company_name}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-widest text-fg-subtle">
              <span>Analyst confidence</span>
              <span className="tnum text-ai">{confidence}%</span>
            </div>
            <ConfidenceBar value={confidence} />
          </div>

          <figure className="relative rounded-xl border border-line/60 bg-bg/50 px-4 py-3.5">
            <span
              aria-hidden
              className="absolute -top-2.5 left-3 select-none font-display text-3xl leading-none text-ai/50"
            >
              &ldquo;
            </span>
            <blockquote className="line-clamp-5 pt-1.5 text-sm leading-relaxed text-fg-muted">
              {topPick.explanation}
            </blockquote>
          </figure>

          <div className="mt-auto pt-1">
            <Link href="/recommendations">
              <Button variant="secondary" size="sm">
                Read the full analysis
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col gap-3.5">
          <div className="flex items-baseline gap-3">
            <h3 className="font-display text-xl font-semibold tracking-tight text-fg">
              {DEFAULT_AI_INSIGHT.headline}
            </h3>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-widest text-fg-subtle">
              <span>Desk confidence</span>
              <span className="tnum text-ai">{confidence}%</span>
            </div>
            <ConfidenceBar value={confidence} />
          </div>
          <figure className="relative rounded-xl border border-line/60 bg-bg/50 px-4 py-3.5">
            <blockquote className="text-sm leading-relaxed text-fg-muted">
              {DEFAULT_AI_INSIGHT.body}
            </blockquote>
          </figure>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_AI_INSIGHT.focusTickers.map((ticker) => (
              <Badge key={ticker} variant="brand" className="tnum">
                {ticker}
              </Badge>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            <Link href="/recommendations">
              <Button variant="secondary" size="sm">
                Explore featured picks
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" size="sm">
                Personalise in chat
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}

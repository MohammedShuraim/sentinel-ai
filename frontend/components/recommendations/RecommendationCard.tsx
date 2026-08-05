"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfidenceBar } from "@/components/common/ConfidenceBar";
import { SparkleIcon } from "@/components/common/icons";
import { formatINR } from "@/lib/format";
import {
  LABEL_ACCENTS,
  MAX_RECOMMENDATION_SCORE,
  confidenceForScore,
  labelForScore,
  labelVariant,
} from "@/lib/recommendations/scoring";
import type { RecommendationItem, StockRead } from "@/lib/api/types";

function confidenceLabel(confidence: number): string {
  if (confidence > 80) return "High";
  if (confidence >= 60) return "Moderate";
  return "Emerging";
}

const sparkIcon = <SparkleIcon className="h-3.5 w-3.5" />;

interface RecommendationCardProps {
  item: RecommendationItem;
  stock?: StockRead;
  watched: boolean;
  watchBusy?: boolean;
  onView: () => void;
  onBuy: () => void;
  onWatchlist: () => void;
  onAnalyze: () => void;
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-line/70 bg-surface/60 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-widest text-fg-subtle">
        {label}
      </p>
      <p className="tnum mt-1 text-sm font-semibold text-fg">{value}</p>
    </div>
  );
}

export function RecommendationCard({
  item,
  stock,
  watched,
  watchBusy = false,
  onView,
  onBuy,
  onWatchlist,
  onAnalyze,
}: RecommendationCardProps) {
  const label = labelForScore(item.score);
  const confidence = item.confidence ?? confidenceForScore(item.score);
  const accent = LABEL_ACCENTS[label];
  const sector = item.sector ?? stock?.sector ?? "—";
  const price =
    item.current_price != null ? formatINR(item.current_price) : "—";
  const expected =
    item.expected_return_pct != null
      ? `~${item.expected_return_pct.toFixed(0)}%`
      : item.expected_return_label ?? "—";
  const risk = item.risk_level ?? "—";
  const horizon = item.time_horizon ?? "—";

  return (
    <Card
      interactive
      className="group relative flex h-full flex-col gap-4 overflow-hidden p-5 transition-[border-color,box-shadow,transform] duration-200 hover:[border-color:var(--rec-accent)] hover:shadow-[0_14px_36px_rgb(0_0_0/0.4),0_0_26px_color-mix(in_srgb,var(--rec-accent)_14%,transparent)]"
      style={{ "--rec-accent": accent } as React.CSSProperties}
    >
      <span
        aria-hidden
        className="absolute inset-y-4 left-0 w-1 rounded-full transition-shadow duration-300 group-hover:shadow-[0_0_12px_var(--rec-accent)]"
        style={{ backgroundColor: accent }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_60%_at_85%_0%,rgb(214_40_40/0.07),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-brand/30 bg-brand-soft font-display text-sm font-semibold tracking-tight text-brand"
          >
            {item.ticker.slice(0, 2)}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tnum font-display text-lg font-semibold tracking-tight text-fg">
                {item.ticker}
              </span>
              <Badge variant="neutral">{sector}</Badge>
              {item.already_owned ? (
                <Badge variant="warn" className="shrink-0">
                  Owned
                </Badge>
              ) : null}
              {watched ? (
                <Badge variant="brand" className="shrink-0">
                  Watching
                </Badge>
              ) : null}
            </div>
            <h3 className="line-clamp-1 text-sm text-fg-muted">
              {item.company_name}
            </h3>
          </div>
        </div>
        <Badge variant={labelVariant(label)} dot className="shrink-0">
          {label}
        </Badge>
      </div>

      <div className="relative grid grid-cols-2 gap-2">
        <Metric label="Current Price" value={price} />
        <Metric label="Expected Return" value={expected} />
        <Metric label="Risk Level" value={risk} />
        <Metric label="Time Horizon" value={horizon} />
      </div>

      <div className="relative flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 uppercase tracking-widest text-fg-subtle">
            {sparkIcon}
            <span className="text-ai">AI</span> confidence
          </span>
          <span className="tnum font-medium text-fg">
            {confidence}%{" "}
            <span className="text-fg-subtle">
              · {confidenceLabel(confidence)}
            </span>
          </span>
        </div>
        <span
          role="img"
          aria-label={`Confidence ${confidence} percent · score ${item.score} of ${MAX_RECOMMENDATION_SCORE}`}
          className="block"
        >
          <ConfidenceBar value={confidence} className="h-1.5" />
        </span>
      </div>

      <blockquote className="relative rounded-xl border border-line/70 bg-elevated/50 px-3.5 py-3">
        <span
          aria-hidden
          className="absolute -top-1.5 left-2 select-none font-display text-2xl leading-none text-ai/40"
        >
          &ldquo;
        </span>
        <p className="line-clamp-3 pl-2 text-sm leading-relaxed text-fg-muted">
          {item.explanation}
        </p>
      </blockquote>

      <div className="relative mt-auto flex flex-col gap-2 border-t border-line/60 pt-3.5">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={(event) => {
              event.stopPropagation();
              onBuy();
            }}
          >
            Buy
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={(event) => {
              event.stopPropagation();
              onView();
            }}
          >
            View Details
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            loading={watchBusy}
            disabled={watchBusy}
            onClick={(event) => {
              event.stopPropagation();
              onWatchlist();
            }}
          >
            {watched ? "Watching" : "Add to Watchlist"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-ai hover:bg-ai-soft hover:text-ai"
            onClick={(event) => {
              event.stopPropagation();
              onAnalyze();
            }}
          >
            {sparkIcon}
            Analyze with AI
          </Button>
        </div>
      </div>
    </Card>
  );
}

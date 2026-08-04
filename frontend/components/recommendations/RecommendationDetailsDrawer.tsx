"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ConfidenceBar } from "@/components/common/ConfidenceBar";
import { SparkleIcon } from "@/components/common/icons";
import {
  MAX_RECOMMENDATION_SCORE,
  confidenceForScore,
  labelForScore,
  labelVariant,
} from "@/lib/recommendations/scoring";
import type { RecommendationItem, RetrievedDocument, StockRead } from "@/lib/api/types";

interface RecommendationDetailsDrawerProps {
  item: RecommendationItem | null;
  stock?: StockRead;
  open: boolean;
  watched?: boolean;
  watchBusy?: boolean;
  onClose: () => void;
  onAnalyze: () => void;
  onBuy: () => void;
  onViewStock: () => void;
  onWatchlist: () => void;
}

const sparkIcon = <SparkleIcon className="h-4 w-4" />;

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-2 flex items-start justify-between gap-4 rounded-lg px-2 py-2.5 transition-colors duration-200 hover:bg-white/[0.03]">
      <dt className="shrink-0 text-sm text-fg-subtle">{label}</dt>
      <dd className="tnum text-right text-sm font-medium text-fg">{children}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-fg-subtle">
      <span aria-hidden className="h-3 w-0.5 rounded-full bg-ai/70" />
      {children}
    </h3>
  );
}

function SourceCard({ source, index }: { source: RetrievedDocument; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="rounded-xl border border-line bg-elevated px-3.5 py-3 transition-[border-color,box-shadow] duration-200 hover:border-ai/30 hover:shadow-[0_0_16px_rgb(139_92_246/0.08)]">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-fg">
          {source.title ?? source.source_type.replace(/_/g, " ")}
        </span>
        <Badge variant="neutral" className="shrink-0">
          {source.source_type.replace(/_/g, " ")}
        </Badge>
      </div>
      <p
        className={`text-xs leading-relaxed text-fg-subtle ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {source.chunk_text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-ai transition-colors hover:text-ai-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai/40 rounded"
      >
        {expanded ? "Show less" : "Read more"}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <span className="sr-only">reasoning source {index + 1}</span>
    </li>
  );
}

export function RecommendationDetailsDrawer({
  item,
  stock,
  open,
  watched = false,
  watchBusy = false,
  onClose,
  onAnalyze,
  onBuy,
  onViewStock,
  onWatchlist,
}: RecommendationDetailsDrawerProps) {
  const label = item ? labelForScore(item.score) : null;
  const confidence = item ? confidenceForScore(item.score) : 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      ariaLabel={
        item
          ? `Recommendation details: ${item.company_name}`
          : "Recommendation details"
      }
      title={
        item ? (
          <div className="flex flex-col gap-2">
            <h2 className="line-clamp-2 font-display text-lg font-semibold tracking-tight text-fg">
              {item.company_name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand" className="tnum">
                {item.ticker}
              </Badge>
              {stock ? <Badge variant="neutral">{stock.sector}</Badge> : null}
              {label ? (
                <Badge variant={labelVariant(label)} dot>
                  {label}
                </Badge>
              ) : null}
              {watched ? <Badge variant="brand">Watching</Badge> : null}
            </div>
          </div>
        ) : null
      }
      footer={
        item ? (
          <div className="flex flex-col gap-2">
            <Button variant="primary" className="w-full" onClick={onBuy}>
              Buy
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="flex-1" onClick={onViewStock}>
                View Details
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                loading={watchBusy}
                disabled={watchBusy}
                onClick={onWatchlist}
              >
                {watched ? "Watching" : "Add to Watchlist"}
              </Button>
            </div>
            <button
              type="button"
              onClick={onAnalyze}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ai-strong to-ai text-sm font-medium text-ai-ink shadow-[0_0_0_1px_rgb(167_139_250/0.3),0_0_20px_rgb(139_92_246/0.25)] transition-all hover:brightness-110 hover:shadow-[0_0_0_1px_rgb(167_139_250/0.4),0_0_30px_rgb(139_92_246/0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai/50 active:scale-[0.98]"
            >
              {sparkIcon}
              Analyze with AI
            </button>
          </div>
        ) : null
      }
    >
      {item ? (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <SectionTitle>Recommendation</SectionTitle>
            <div className="rounded-xl border border-ai/20 bg-ai-soft/40 px-3.5 py-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-fg-subtle">
                  <span className="text-ai">{sparkIcon}</span>
                  Confidence
                </span>
                <span className="tnum font-semibold text-fg">{confidence}%</span>
              </div>
              <ConfidenceBar value={confidence} className="h-2" />
            </div>
            <dl className="divide-y divide-line/60">
              <Row label="Overall Score">
                {item.score} / {MAX_RECOMMENDATION_SCORE}
              </Row>
              <Row label="Recommendation">
                {label ? (
                  <Badge variant={labelVariant(label)}>{label}</Badge>
                ) : (
                  "Not available"
                )}
              </Row>
            </dl>
          </section>

          <section className="flex flex-col gap-2">
            <SectionTitle>Company Information</SectionTitle>
            <dl className="divide-y divide-line/60">
              <Row label="Ticker">{item.ticker}</Row>
              <Row label="Company">{item.company_name}</Row>
              <Row label="Sector">{stock?.sector ?? "Not available"}</Row>
              <Row label="Industry">{stock?.industry ?? "Not available"}</Row>
              <Row label="Exchange">{stock?.exchange ?? "Not available"}</Row>
            </dl>
          </section>

          <section className="flex flex-col gap-2">
            <SectionTitle>AI Explanation</SectionTitle>
            <blockquote className="relative rounded-xl border border-line/70 bg-elevated/50 px-4 py-3.5">
              <span
                aria-hidden
                className="absolute -top-1.5 left-2.5 select-none font-display text-3xl leading-none text-ai/40"
              >
                &ldquo;
              </span>
              <p className="pl-2.5 text-sm leading-relaxed text-fg-muted">
                {item.explanation || "Not available"}
              </p>
            </blockquote>
          </section>

          <section className="flex flex-col gap-2">
            <SectionTitle>Supporting Reasoning</SectionTitle>
            {item.sources.length === 0 ? (
              <p className="text-sm text-fg-subtle">Not available</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {item.sources.map((source, index) => (
                  <SourceCard
                    key={`${source.source_type}-${source.news_id ?? source.fundamental_id ?? index}`}
                    source={source}
                    index={index}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </Drawer>
  );
}

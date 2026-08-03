"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/common/CountUp";
import { ConfidenceBar } from "@/components/common/ConfidenceBar";
import {
  confidenceForScore,
  labelForScore,
} from "@/lib/recommendations/scoring";
import type { RecommendationItem } from "@/lib/api/types";

export function RecommendationSummary({
  items,
}: {
  items: RecommendationItem[];
}) {
  const stats = useMemo(() => {
    const strongBuy = items.filter(
      (item) => labelForScore(item.score) === "Strong Buy",
    ).length;
    const buy = items.filter(
      (item) => labelForScore(item.score) === "Buy",
    ).length;
    const averageConfidence =
      items.length > 0
        ? Math.round(
            items.reduce((sum, item) => sum + confidenceForScore(item.score), 0) /
              items.length,
          )
        : 0;
    return {
      total: items.length,
      strongBuy,
      buy,
      averageConfidence,
    };
  }, [items]);

  const cards = [
    {
      key: "total",
      label: "Recommendations",
      value: stats.total,
      format: (v: number) => String(Math.round(v)),
      tone: "text-fg",
      iconTone: "text-info bg-info-soft",
      glow: "hover:border-info/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(96_165_250/0.12)]",
      icon: (
        <path d="M4 5.5h16M4 12h16M4 18.5h16" />
      ),
    },
    {
      key: "strong-buy",
      label: "Strong Buy",
      value: stats.strongBuy,
      format: (v: number) => String(Math.round(v)),
      tone: "text-profit",
      iconTone: "text-profit bg-profit-soft",
      glow: "hover:border-profit/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(52_211_153/0.14)]",
      icon: (
        <>
          <path d="m4 16 5.5-6 4 3.5L20 7" />
          <path d="M15.5 7H20v4.5" />
        </>
      ),
    },
    {
      key: "buy",
      label: "Buy",
      value: stats.buy,
      format: (v: number) => String(Math.round(v)),
      tone: "text-brand",
      iconTone: "text-brand bg-brand-soft",
      glow: "hover:border-brand/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(52_211_153/0.12)]",
      icon: <path d="m4 15 5-4.5 4 3 7-7.5" />,
    },
    {
      key: "confidence",
      label: "Avg. Confidence",
      value: stats.averageConfidence,
      format: (v: number) => `${Math.round(v)}%`,
      tone: "text-fg",
      iconTone: "text-ai bg-ai-soft",
      glow: "hover:border-ai/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(139_92_246/0.16)]",
      icon: (
        <>
          <path d="M12 20a8 8 0 1 0-8-8" />
          <path d="M12 12l4.5-4.5" />
          <path d="M4 12h2M12 4v2" />
        </>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.key}
          interactive
          className={`group relative flex items-center justify-between gap-3 overflow-hidden p-5 transition-[border-color,box-shadow,transform] duration-200 ${card.glow}`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_90%_at_100%_0%,rgb(255_255_255/0.03),transparent_60%)]"
          />
          <div className="relative flex min-w-0 flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-widest text-fg-subtle">
              {card.label}
            </p>
            <p
              className={`tnum truncate font-display text-2xl font-semibold tracking-tight ${card.tone}`}
            >
              <CountUp value={card.value} format={card.format} />
            </p>
            {card.key === "confidence" ? (
              <ConfidenceBar value={stats.averageConfidence} className="w-24" />
            ) : null}
          </div>
          <span
            aria-hidden
            className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-white/[0.04] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110 ${card.iconTone}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {card.icon}
            </svg>
          </span>
        </Card>
      ))}
    </div>
  );
}

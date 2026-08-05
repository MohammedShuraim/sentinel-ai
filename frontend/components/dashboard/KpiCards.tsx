"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/common/CountUp";
import { dashboardItem } from "@/components/dashboard/Section";
import { formatINR, formatQuantity } from "@/lib/format";
import type { PortfolioSummary } from "@/lib/api/types";

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const icons = {
  invested: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <path d="M6.5 4h11M6.5 8.5h11" />
      <path d="M17.5 4c0 5-4 6.5-7 6.5l7.5 9.5" />
    </svg>
  ),
  holdings: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <rect x="3.5" y="8" width="17" height="12" rx="2" />
      <path d="M8.5 8V6.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V8" />
      <path d="M3.5 13h17" />
    </svg>
  ),
  units: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <path d="M4 20V10" />
      <path d="M9.5 20V4" />
      <path d="M15 20v-8" />
      <path d="M20.5 20V7" />
    </svg>
  ),
  watchlist: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <path d="M12 4.5c-4.5 0-8 3.5-9.5 7.5 1.5 4 5 7.5 9.5 7.5s8-3.5 9.5-7.5c-1.5-4-5-7.5-9.5-7.5Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

interface KpiCardsProps {
  summary: PortfolioSummary | null;
  watchlistCount: number;
  loading: boolean;
}

export function KpiCards({ summary, watchlistCount, loading }: KpiCardsProps) {
  const cards = [
    {
      key: "invested",
      label: "Total invested",
      value: summary?.total_invested ?? null,
      format: formatINR,
      icon: icons.invested,
      tone: "text-brand bg-brand-soft",
      glow: "hover:border-brand/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(214_40_40/0.12)]",
    },
    {
      key: "holdings",
      label: "Holdings",
      value: summary?.total_holdings ?? null,
      format: (v: number) => String(Math.round(v)),
      icon: icons.holdings,
      tone: "text-info bg-info-soft",
      glow: "hover:border-info/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(96_165_250/0.12)]",
    },
    {
      key: "units",
      label: "Units held",
      value: summary?.total_quantity ?? null,
      format: formatQuantity,
      icon: icons.units,
      tone: "text-warn bg-warn-soft",
      glow: "hover:border-warn/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(251_191_36/0.10)]",
    },
    {
      key: "watchlist",
      label: "Watchlist",
      value: watchlistCount,
      format: (v: number) => String(Math.round(v)),
      icon: icons.watchlist,
      tone: "text-fg-muted bg-elevated",
      glow: "hover:border-line-strong hover:shadow-[0_10px_30px_rgb(0_0_0/0.35)]",
    },
  ];

  return (
    <motion.div
      variants={dashboardItem}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <Card
          key={card.key}
          interactive
          className={`group flex items-start justify-between p-5 transition-[border-color,box-shadow,transform] duration-200 ${card.glow}`}
        >
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-widest text-fg-subtle">
              {card.label}
            </p>
            {loading ? (
              <div className="skeleton h-8 w-24" />
            ) : (
              <p className="tnum truncate font-display text-2xl font-semibold tracking-tight text-fg">
                {card.value === null ? (
                  "—"
                ) : (
                  <CountUp value={card.value} format={card.format} />
                )}
              </p>
            )}
          </div>
          <span
            aria-hidden
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110 ${card.tone}`}
          >
            {card.icon("h-5 w-5")}
          </span>
        </Card>
      ))}
    </motion.div>
  );
}

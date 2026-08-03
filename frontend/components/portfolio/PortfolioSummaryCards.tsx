"use client";

import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/common/CountUp";
import { formatINR, formatINRCompact, formatQuantity } from "@/lib/format";
import type { PortfolioSummary } from "@/lib/api/types";

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const icons = {
  holdings: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <rect x="3.5" y="8" width="17" height="12" rx="2" />
      <path d="M8.5 8V6.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V8" />
      <path d="M3.5 13h17" />
    </svg>
  ),
  quantity: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <path d="M4 20V10" />
      <path d="M9.5 20V4" />
      <path d="M15 20v-8" />
      <path d="M20.5 20V7" />
    </svg>
  ),
  invested: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <path d="M6.5 4h11M6.5 8.5h11" />
      <path d="M17.5 4c0 5-4 6.5-7 6.5l7.5 9.5" />
    </svg>
  ),
  average: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <path d="M4 12h16" />
      <path d="M7 7h10M7 17h10" />
    </svg>
  ),
};

export function PortfolioSummaryCards({
  summary,
}: {
  summary: PortfolioSummary | null;
}) {
  const averageInvestment =
    summary && summary.total_holdings > 0
      ? summary.total_invested / summary.total_holdings
      : null;

  const cards = [
    {
      key: "holdings",
      label: "Total Holdings",
      value: summary?.total_holdings ?? null,
      format: (v: number) => String(Math.round(v)),
      icon: icons.holdings,
      tone: "text-info bg-info-soft",
      glow: "hover:border-info/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(96_165_250/0.12)]",
    },
    {
      key: "quantity",
      label: "Total Quantity",
      value: summary?.total_quantity ?? null,
      format: formatQuantity,
      icon: icons.quantity,
      tone: "text-warn bg-warn-soft",
      glow: "hover:border-warn/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(251_191_36/0.10)]",
    },
    {
      key: "invested",
      label: "Total Invested",
      value: summary?.total_invested ?? null,
      format: formatINRCompact,
      icon: icons.invested,
      tone: "text-brand bg-brand-soft",
      glow: "hover:border-brand/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(52_211_153/0.12)]",
    },
    {
      key: "average",
      label: "Avg. Investment",
      value: averageInvestment,
      format: formatINR,
      icon: icons.average,
      tone: "text-fg-muted bg-elevated",
      glow: "hover:border-line-strong hover:shadow-[0_10px_30px_rgb(0_0_0/0.35)]",
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
          <div className="relative flex min-w-0 flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-widest text-fg-subtle">
              {card.label}
            </p>
            <p className="tnum truncate font-display text-2xl font-semibold tracking-tight text-fg">
              {card.value === null ? (
                "—"
              ) : (
                <CountUp value={card.value} format={card.format} />
              )}
            </p>
          </div>
          <span
            aria-hidden
            className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-white/[0.04] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110 ${card.tone}`}
          >
            {card.icon("h-5 w-5")}
          </span>
        </Card>
      ))}
    </div>
  );
}

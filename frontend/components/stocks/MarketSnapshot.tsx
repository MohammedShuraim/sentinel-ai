"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/common/CountUp";
import type { StockRead } from "@/lib/api/types";

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const icons = {
  total: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <path d="M4 20V10" />
      <path d="M9.5 20V4" />
      <path d="M15 20v-8" />
      <path d="M20.5 20V7" />
    </svg>
  ),
  active: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <path d="M3.5 12.5 8.5 17.5 20.5 5.5" />
    </svg>
  ),
  sectors: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  ),
  exchanges: (className: string) => (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
      <path d="M4 9.5 12 4.5l8 5" />
      <path d="M5.5 10v7M10 10v7M14 10v7M18.5 10v7" />
      <path d="M3.5 19.5h17" />
    </svg>
  ),
};

export function MarketSnapshot({ stocks }: { stocks: StockRead[] }) {
  const stats = useMemo(() => {
    const sectors = new Set(stocks.map((stock) => stock.sector));
    const exchanges = new Set(stocks.map((stock) => stock.exchange));
    const active = stocks.filter((stock) => stock.is_active).length;
    return {
      total: stocks.length,
      active,
      sectors: sectors.size,
      exchanges: exchanges.size,
    };
  }, [stocks]);

  const cards = [
    { key: "total", label: "Total Stocks", value: stats.total, icon: icons.total, tone: "text-brand bg-brand-soft", glow: "hover:border-brand/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(214_40_40/0.12)]" },
    { key: "active", label: "Active Stocks", value: stats.active, icon: icons.active, tone: "text-profit bg-profit-soft", glow: "hover:border-profit/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(22_199_132/0.12)]" },
    { key: "sectors", label: "Sectors", value: stats.sectors, icon: icons.sectors, tone: "text-info bg-info-soft", glow: "hover:border-info/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(96_165_250/0.12)]" },
    { key: "exchanges", label: "Exchanges", value: stats.exchanges, icon: icons.exchanges, tone: "text-warn bg-warn-soft", glow: "hover:border-warn/40 hover:shadow-[0_10px_30px_rgb(0_0_0/0.35),0_0_22px_rgb(251_191_36/0.10)]" },
  ];

  const formatCount = (v: number) => String(Math.round(v));

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
            <p className="tnum font-display text-2xl font-semibold tracking-tight text-fg">
              <CountUp value={card.value} format={formatCount} duration={0.9} />
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

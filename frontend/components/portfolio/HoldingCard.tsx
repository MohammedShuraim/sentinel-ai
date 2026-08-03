"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SparkleIcon } from "@/components/common/icons";
import { formatINR, formatQuantity } from "@/lib/format";
import type { PortfolioRead, StockRead } from "@/lib/api/types";

const iconStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const actionIcons = {
  buy: (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" {...iconStroke}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  sell: (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" {...iconStroke}>
      <path d="M5 12h14" />
    </svg>
  ),
  view: (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" {...iconStroke}>
      <path d="M12 4.5c-4.5 0-8 3.5-9.5 7.5 1.5 4 5 7.5 9.5 7.5s8-3.5 9.5-7.5c-1.5-4-5-7.5-9.5-7.5Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  analyze: <SparkleIcon className="h-3.5 w-3.5" />,
};

interface HoldingCardProps {
  holding: PortfolioRead;
  stock?: StockRead;
  onView: () => void;
  onBuy: () => void;
  onSell: () => void;
  onAnalyze: () => void;
}

export function HoldingCard({
  holding,
  stock,
  onView,
  onBuy,
  onSell,
  onAnalyze,
}: HoldingCardProps) {
  const invested = holding.quantity * holding.average_price;

  return (
    <Card
      interactive
      className="group relative flex h-full flex-col gap-4 overflow-hidden p-5 transition-[border-color,box-shadow,transform] duration-200 hover:border-brand/35 hover:shadow-[0_12px_34px_rgb(0_0_0/0.38),0_0_24px_rgb(52_211_153/0.10)]"
    >
      {/* soft radial highlight on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_60%_at_85%_0%,rgb(52_211_153/0.06),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {stock ? (
              <span className="tnum font-display text-lg font-semibold tracking-tight text-fg">
                {stock.ticker}
              </span>
            ) : null}
            {stock ? (
              <Badge variant="neutral" className="tnum">
                {stock.exchange}
              </Badge>
            ) : null}
          </div>
          <h3 className="line-clamp-1 text-sm text-fg-muted">
            {stock ? stock.company_name : `Stock #${holding.stock_id}`}
          </h3>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <p className="tnum font-display text-xl font-semibold text-fg drop-shadow-[0_0_20px_rgb(52_211_153/0.15)]">
            {formatINR(invested)}
          </p>
          <p className="text-[11px] uppercase tracking-widest text-fg-subtle">
            invested
          </p>
        </div>
      </div>

      <dl className="relative grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line bg-elevated px-3 py-2 transition-colors duration-200 group-hover:border-line-strong">
          <dt className="text-[11px] uppercase tracking-widest text-fg-subtle">
            Quantity
          </dt>
          <dd className="tnum text-sm font-medium text-fg">
            {formatQuantity(holding.quantity)}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-elevated px-3 py-2 transition-colors duration-200 group-hover:border-line-strong">
          <dt className="text-[11px] uppercase tracking-widest text-fg-subtle">
            Avg. Price
          </dt>
          <dd className="tnum text-sm font-medium text-fg">
            {formatINR(holding.average_price)}
          </dd>
        </div>
      </dl>

      <div className="relative mt-auto flex flex-col gap-2 border-t border-line/60 pt-3.5">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onBuy}>
            {actionIcons.buy}
            Buy More
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-loss/30 text-loss hover:bg-loss-soft"
            onClick={onSell}
          >
            {actionIcons.sell}
            Sell
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="flex-1" onClick={onView}>
            {actionIcons.view}
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-ai hover:bg-ai-soft hover:text-ai"
            onClick={onAnalyze}
          >
            {actionIcons.analyze}
            Analyze
          </Button>
        </div>
      </div>
    </Card>
  );
}

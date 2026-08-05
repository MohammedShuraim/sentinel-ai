"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { StockRead } from "@/lib/api/types";

export function StockCard({
  stock,
  onViewDetails,
  onBuy,
}: {
  stock: StockRead;
  onViewDetails?: (stock: StockRead) => void;
  onBuy?: (stock: StockRead) => void;
}) {
  return (
    <Card
      interactive
      className="group relative flex h-full flex-col gap-4 overflow-hidden p-5 transition-[border-color,box-shadow,transform] duration-200 hover:border-brand/35 hover:shadow-[0_12px_34px_rgb(0_0_0/0.38),0_0_24px_rgb(214_40_40/0.10)]"
    >
      {/* soft radial highlight on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_60%_at_85%_0%,rgb(214_40_40/0.06),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tnum font-display text-lg font-semibold tracking-tight text-fg">
              {stock.ticker}
            </span>
            <Badge variant="neutral" className="tnum">
              {stock.exchange}
            </Badge>
          </div>
          <h3 className="line-clamp-1 text-sm text-fg-muted">
            {stock.company_name}
          </h3>
        </div>
        <Badge
          variant={stock.is_active ? "profit" : "neutral"}
          dot={stock.is_active}
          className="shrink-0"
        >
          {stock.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="relative flex flex-col gap-1">
        <p className="line-clamp-1 text-sm font-medium text-fg-muted">
          {stock.sector}
        </p>
        <p className="line-clamp-1 text-xs text-fg-subtle">{stock.industry}</p>
      </div>

      <div className="relative mt-auto flex items-center gap-2 border-t border-line/60 pt-3.5">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={(event) => {
            event.stopPropagation();
            onBuy?.(stock);
          }}
        >
          Buy
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails?.(stock)}
        >
          Details
        </Button>
      </div>
    </Card>
  );
}

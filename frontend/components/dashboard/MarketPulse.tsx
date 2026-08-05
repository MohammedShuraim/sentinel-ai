"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  MARKET_INDICES,
  TOP_GAINERS,
  TOP_LOSERS,
} from "@/lib/market/starterContent";
import { cn } from "@/lib/utils/cn";

function Pct({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        "tnum text-xs font-semibold",
        up ? "text-profit" : "text-loss",
      )}
    >
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export function MarketPulse() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-fg-subtle">
            Market pulse
          </p>
          <h2 className="font-display text-lg font-semibold text-fg">
            Live session board
          </h2>
        </div>
        <Badge variant="neutral">Indicative snapshot</Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MARKET_INDICES.map((index) => (
          <Card key={index.name} className="p-4" accent={false}>
            <p className="text-[11px] font-medium uppercase tracking-widest text-fg-subtle">
              {index.name}
            </p>
            <div className="mt-2 flex items-end justify-between gap-2">
              <p className="tnum font-display text-xl font-semibold text-fg">
                {index.value.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
              <Pct value={index.changePct} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4" accent={false}>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-profit">
            Top gainers
          </p>
          <ul className="flex flex-col divide-y divide-line/60">
            {TOP_GAINERS.map((mover) => (
              <li
                key={mover.ticker}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="tnum text-sm font-semibold text-fg">
                    {mover.ticker}
                  </p>
                  <p className="truncate text-xs text-fg-subtle">
                    {mover.companyName}
                  </p>
                </div>
                <Pct value={mover.changePct} />
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4" accent={false}>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-loss">
            Top losers
          </p>
          <ul className="flex flex-col divide-y divide-line/60">
            {TOP_LOSERS.map((mover) => (
              <li
                key={mover.ticker}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="tnum text-sm font-semibold text-fg">
                    {mover.ticker}
                  </p>
                  <p className="truncate text-xs text-fg-subtle">
                    {mover.companyName}
                  </p>
                </div>
                <Pct value={mover.changePct} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

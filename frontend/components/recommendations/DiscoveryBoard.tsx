"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfidenceBar } from "@/components/common/ConfidenceBar";
import {
  FEATURED_PICKS,
  POPULAR_SECTORS,
  type FeaturedPick,
  picksByCategory,
} from "@/lib/market/starterContent";

const SECTIONS: {
  key: FeaturedPick["category"] | "all";
  title: string;
  subtitle: string;
}[] = [
  {
    key: "featured",
    title: "Featured stocks",
    subtitle: "Large-cap anchors commonly used in starter Indian portfolios.",
  },
  {
    key: "trending",
    title: "Trending stocks",
    subtitle: "Names seeing elevated retail interest this session.",
  },
  {
    key: "dividend",
    title: "Dividend picks",
    subtitle: "Cash-generative businesses for income-oriented sleeves.",
  },
  {
    key: "growth",
    title: "Growth picks",
    subtitle: "Quality compounders for medium- to long-term horizons.",
  },
  {
    key: "editors",
    title: "Editor's AI picks",
    subtitle: "Curated AI desk ideas while your personal engine warms up.",
  },
];

function PickCard({
  pick,
  canBuy,
  onSelect,
  onBuy,
}: {
  pick: FeaturedPick;
  canBuy: boolean;
  onSelect?: (pick: FeaturedPick) => void;
  onBuy?: (pick: FeaturedPick) => void;
}) {
  return (
    <Card
      interactive
      className="flex h-full flex-col gap-3 p-4"
      onClick={() => onSelect?.(pick)}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="tnum font-display text-lg font-semibold text-fg">
            {pick.ticker}
          </p>
          <p className="line-clamp-1 text-xs text-fg-muted">
            {pick.companyName}
          </p>
        </div>
        <Badge variant="neutral">{pick.sector}</Badge>
      </div>
      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-fg-muted">
        {pick.thesis}
      </p>
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <p className="uppercase tracking-widest text-fg-subtle">Risk</p>
          <p className="mt-0.5 font-medium text-fg">{pick.riskLevel}</p>
        </div>
        <div>
          <p className="uppercase tracking-widest text-fg-subtle">Horizon</p>
          <p className="mt-0.5 font-medium text-fg">{pick.timeHorizon}</p>
        </div>
        <div>
          <p className="uppercase tracking-widest text-fg-subtle">Return</p>
          <p className="mt-0.5 font-medium text-fg">
            {pick.expectedReturnLabel}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[11px] text-fg-subtle">
          <span>AI confidence</span>
          <span className="tnum text-fg">{pick.confidence}%</span>
        </div>
        <ConfidenceBar value={pick.confidence} />
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          disabled={!canBuy}
          title={
            canBuy
              ? `Buy ${pick.ticker}`
              : "Stock not in market universe yet"
          }
          onClick={(event) => {
            event.stopPropagation();
            onBuy?.(pick);
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
            onSelect?.(pick);
          }}
        >
          Details
        </Button>
      </div>
    </Card>
  );
}

export function DiscoveryBoard({
  tradableTickers,
  onSelectTicker,
  onBuy,
}: {
  /** Uppercase tickers that exist in the live stock universe (buyable). */
  tradableTickers?: Set<string>;
  onSelectTicker?: (ticker: string) => void;
  onBuy?: (pick: FeaturedPick) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="brand" dot className="mb-2">
            Discovery mode
          </Badge>
          <h2 className="font-display text-xl font-semibold text-fg">
            Explore the market while we personalise
          </h2>
          <p className="mt-1 max-w-xl text-sm text-fg-muted">
            Buy from these desks to build your portfolio now. After your
            investor profile is ready, this page switches to fully personalised
            AI recommendations with the same Buy flow.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/stocks">
            <Button variant="secondary">Browse stocks</Button>
          </Link>
          <Link href="/chat">
            <Button variant="primary">Ask AI analyst</Button>
          </Link>
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <h3 className="font-display text-lg font-semibold text-fg">
          Popular sectors
        </h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SECTORS.map((sector) => (
            <Link
              key={sector}
              href={`/stocks?sector=${encodeURIComponent(sector)}`}
            >
              <Badge
                variant="neutral"
                className="cursor-pointer px-3 py-1.5 text-sm hover:border-brand/40 hover:text-brand"
              >
                {sector}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {SECTIONS.map((section) => {
        const picks =
          section.key === "all"
            ? FEATURED_PICKS
            : picksByCategory(section.key);
        if (picks.length === 0) {
          return null;
        }
        return (
          <section key={section.title} className="flex flex-col gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-fg">
                {section.title}
              </h3>
              <p className="text-sm text-fg-muted">{section.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {picks.map((pick) => (
                <PickCard
                  key={`${section.title}-${pick.ticker}`}
                  pick={pick}
                  canBuy={
                    tradableTickers?.has(pick.ticker.toUpperCase()) ?? false
                  }
                  onSelect={(selected) => onSelectTicker?.(selected.ticker)}
                  onBuy={onBuy}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

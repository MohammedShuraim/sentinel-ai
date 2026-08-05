"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/common/ErrorState";
import { dashboardContainer, dashboardItem } from "@/components/dashboard/Section";
import { useStocks } from "@/hooks/useStocks";
import { MarketSnapshot } from "@/components/stocks/MarketSnapshot";
import { SearchBar } from "@/components/stocks/SearchBar";
import { SectorFilters } from "@/components/stocks/SectorFilters";
import { SortDropdown, type StockSort } from "@/components/stocks/SortDropdown";
import { StockGrid } from "@/components/stocks/StockGrid";
import { StockSkeleton } from "@/components/stocks/StockSkeleton";
import { StockDetailsDrawer } from "@/components/stocks/StockDetailsDrawer";
import { Badge } from "@/components/ui/Badge";
import { TradeModal, type TradeTarget } from "@/components/portfolio/TradeModal";
import {
  MOST_ACTIVE_TICKERS,
  TOP_GAINERS,
  TOP_LOSERS,
  filterStocksByTickers,
} from "@/lib/market/starterContent";
import type { StockRead } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

const collator = new Intl.Collator("en", { sensitivity: "base" });

type MarketLens =
  | "all"
  | "gainers"
  | "losers"
  | "active"
  | "recent"
  | "sector";

function sortStocks(stocks: StockRead[], sort: StockSort): StockRead[] {
  const sorted = [...stocks];
  switch (sort) {
    case "az":
      return sorted.sort((a, b) => collator.compare(a.company_name, b.company_name));
    case "za":
      return sorted.sort((a, b) => collator.compare(b.company_name, a.company_name));
    case "sector":
      return sorted.sort(
        (a, b) =>
          collator.compare(a.sector, b.sector) ||
          collator.compare(a.company_name, b.company_name),
      );
    case "exchange":
      return sorted.sort(
        (a, b) =>
          collator.compare(a.exchange, b.exchange) ||
          collator.compare(a.company_name, b.company_name),
      );
  }
}

function StocksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stocks, loading, error, retry } = useStocks();
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState<string | null>(
    () => searchParams.get("sector"),
  );
  const [lens, setLens] = useState<MarketLens>("all");
  const [sort, setSort] = useState<StockSort>("az");
  const [selectedStock, setSelectedStock] = useState<StockRead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tradeTarget, setTradeTarget] = useState<TradeTarget | null>(null);
  const deepLinkHandledRef = useRef(false);

  function openDetails(stock: StockRead) {
    setSelectedStock(stock);
    setDrawerOpen(true);
  }

  function openBuy(stock: StockRead) {
    setTradeTarget({
      stockId: stock.id,
      ticker: stock.ticker,
      companyName: stock.company_name,
      ownedQuantity: 0,
    });
  }

  useEffect(() => {
    if (deepLinkHandledRef.current || loading) {
      return;
    }
    const ticker = searchParams.get("details");
    if (!ticker) {
      return;
    }
    deepLinkHandledRef.current = true;
    router.replace("/stocks");
    const match = stocks.find(
      (stock) => stock.ticker.toLowerCase() === ticker.toLowerCase(),
    );
    if (match) {
      queueMicrotask(() => openDetails(match));
    }
  }, [searchParams, stocks, loading, router]);

  const sectors = useMemo(
    () =>
      [...new Set(stocks.map((stock) => stock.sector))].sort((a, b) =>
        collator.compare(a, b),
      ),
    [stocks],
  );

  const visibleStocks = useMemo(() => {
    const term = query.trim().toLowerCase();
    let pool = stocks;

    if (lens === "gainers") {
      const matched = filterStocksByTickers(
        stocks,
        TOP_GAINERS.map((mover) => mover.ticker),
      );
      pool = matched.length > 0 ? matched : stocks.slice(0, 8);
    } else if (lens === "losers") {
      const matched = filterStocksByTickers(
        stocks,
        TOP_LOSERS.map((mover) => mover.ticker),
      );
      pool = matched.length > 0 ? matched : stocks.slice(0, 8);
    } else if (lens === "active") {
      const matched = filterStocksByTickers(stocks, MOST_ACTIVE_TICKERS);
      pool = matched.length > 0 ? matched : stocks.slice(0, 12);
    } else if (lens === "recent") {
      pool = [...stocks].slice(-12).reverse();
    }

    const filtered = pool.filter((stock) => {
      if (sector !== null && stock.sector !== sector) {
        return false;
      }
      if (term.length === 0) {
        return true;
      }
      return (
        stock.ticker.toLowerCase().includes(term) ||
        stock.company_name.toLowerCase().includes(term) ||
        stock.sector.toLowerCase().includes(term)
      );
    });
    return sortStocks(filtered, sort);
  }, [stocks, query, sector, sort, lens]);

  const lenses: { id: MarketLens; label: string }[] = [
    { id: "all", label: "All stocks" },
    { id: "gainers", label: "Top gainers" },
    { id: "losers", label: "Top losers" },
    { id: "active", label: "Most active" },
    { id: "recent", label: "Recently added" },
  ];

  return (
    <motion.div
      variants={dashboardContainer}
      initial="hidden"
      animate="show"
      className="relative flex flex-col gap-6"
    >
      {/* faint market atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[380px] bg-[radial-gradient(56%_58%_at_50%_0%,rgb(214_40_40/0.05),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[380px] bg-[radial-gradient(30%_48%_at_8%_20%,rgb(96_165_250/0.04),transparent_70%)]"
      />

      <motion.div variants={dashboardItem} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-widest text-fg-subtle">
            Market universe
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Stocks Explorer
          </h1>
          <p className="max-w-xl text-sm text-fg-muted">
            Browse the tracked NSE universe and find your next idea.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchBar value={query} onChange={setQuery} />
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </motion.div>

      <motion.div variants={dashboardItem}>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-5">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton mt-3 h-8 w-16" />
              </Card>
            ))}
          </div>
        ) : (
          <MarketSnapshot stocks={stocks} />
        )}
      </motion.div>

      <motion.div
        variants={dashboardItem}
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Market lenses"
      >
        {lenses.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={lens === entry.id}
            onClick={() => setLens(entry.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              lens === entry.id
                ? "border-brand/50 bg-brand-soft text-brand"
                : "border-line bg-elevated/50 text-fg-muted hover:text-fg",
            )}
          >
            {entry.label}
          </button>
        ))}
      </motion.div>

      <motion.div
        variants={dashboardItem}
        className="grid grid-cols-1 gap-3 md:grid-cols-2"
      >
        <Card className="p-4" accent={false}>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-profit">
            Top gainers · indicative
          </p>
          <div className="flex flex-wrap gap-2">
            {TOP_GAINERS.map((mover) => (
              <Badge key={mover.ticker} variant="profit" className="tnum">
                {mover.ticker} +{mover.changePct.toFixed(2)}%
              </Badge>
            ))}
          </div>
        </Card>
        <Card className="p-4" accent={false}>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-loss">
            Top losers · indicative
          </p>
          <div className="flex flex-wrap gap-2">
            {TOP_LOSERS.map((mover) => (
              <Badge key={mover.ticker} variant="loss" className="tnum">
                {mover.ticker} {mover.changePct.toFixed(2)}%
              </Badge>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={dashboardItem}>
        <SectorFilters
          sectors={sectors}
          selected={sector}
          onSelect={(next) => {
            setSector(next);
            setLens(next ? "sector" : "all");
          }}
        />
      </motion.div>

      <motion.div variants={dashboardItem}>
        {loading ? (
          <StockSkeleton />
        ) : error ? (
          <ErrorState
            title="Unable to load stocks."
            description="The stock universe could not be fetched. Check your connection and try again."
            onRetry={retry}
          />
        ) : visibleStocks.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm font-medium text-fg">
              No matching stocks found.
            </p>
            <p className="max-w-sm text-sm text-fg-muted">
              Try another company or ticker.
            </p>
            {sector !== null || query.trim().length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setSector(null);
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </Card>
        ) : (
          <StockGrid
            stocks={visibleStocks}
            onViewDetails={openDetails}
            onBuy={openBuy}
          />
        )}
      </motion.div>

      <StockDetailsDrawer
        stock={selectedStock}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBuy={(stock) => {
          setDrawerOpen(false);
          openBuy(stock);
        }}
      />

      <TradeModal
        mode="buy"
        target={tradeTarget}
        open={tradeTarget !== null}
        onClose={() => setTradeTarget(null)}
        onSuccess={() => {
          setTradeTarget(null);
        }}
      />
    </motion.div>
  );
}

export default function StocksPage() {
  return (
    <Suspense fallback={null}>
      <StocksContent />
    </Suspense>
  );
}

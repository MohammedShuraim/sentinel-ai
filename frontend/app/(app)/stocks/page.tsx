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
import type { StockRead } from "@/lib/api/types";

const collator = new Intl.Collator("en", { sensitivity: "base" });

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
  const [sector, setSector] = useState<string | null>(null);
  const [sort, setSort] = useState<StockSort>("az");
  const [selectedStock, setSelectedStock] = useState<StockRead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const deepLinkHandledRef = useRef(false);

  function openDetails(stock: StockRead) {
    setSelectedStock(stock);
    setDrawerOpen(true);
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
    const filtered = stocks.filter((stock) => {
      if (sector !== null && stock.sector !== sector) {
        return false;
      }
      if (term.length === 0) {
        return true;
      }
      return (
        stock.ticker.toLowerCase().includes(term) ||
        stock.company_name.toLowerCase().includes(term)
      );
    });
    return sortStocks(filtered, sort);
  }, [stocks, query, sector, sort]);

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
        <MarketSnapshot stocks={stocks} />
      </motion.div>

      <motion.div variants={dashboardItem}>
        <SectorFilters sectors={sectors} selected={sector} onSelect={setSector} />
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
          <StockGrid stocks={visibleStocks} onViewDetails={openDetails} />
        )}
      </motion.div>

      <StockDetailsDrawer
        stock={selectedStock}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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

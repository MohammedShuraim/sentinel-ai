"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/common/ErrorState";
import { SparkleIcon } from "@/components/common/icons";
import { Spinner } from "@/components/common/Spinner";
import { dashboardContainer, dashboardItem } from "@/components/dashboard/Section";
import { SearchBar } from "@/components/stocks/SearchBar";
import { TradeModal, type TradeTarget } from "@/components/portfolio/TradeModal";
import { useToast } from "@/components/providers/ToastProvider";
import { useRecommendations } from "@/hooks/useRecommendations";
import { RecommendationSummary } from "@/components/recommendations/RecommendationSummary";
import {
  RecommendationFilters,
  type RecommendationFilter,
} from "@/components/recommendations/RecommendationFilters";
import {
  RecommendationSort,
  type RecommendationSortOption,
} from "@/components/recommendations/RecommendationSort";
import { RecommendationGrid } from "@/components/recommendations/RecommendationGrid";
import { RecommendationDetailsDrawer } from "@/components/recommendations/RecommendationDetailsDrawer";
import { RecommendationSkeleton } from "@/components/recommendations/RecommendationSkeleton";
import { openRecommendationAnalysis } from "@/lib/chat/chatNavigation";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  followStock,
  getFollowedStocks,
  unfollowStock,
} from "@/lib/api/stocks";
import {
  confidenceForScore,
  labelForScore,
  labelRank,
} from "@/lib/recommendations/scoring";
import type { RecommendationItem } from "@/lib/api/types";

const collator = new Intl.Collator("en", { sensitivity: "base" });

export default function RecommendationsPage() {
  const router = useRouter();
  const { push } = useToast();
  const { items, stocksById, loading, refreshing, error, retry, refresh } =
    useRecommendations();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RecommendationFilter>(null);
  const [sort, setSort] = useState<RecommendationSortOption>("highest");
  const [selected, setSelected] = useState<RecommendationItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tradeTarget, setTradeTarget] = useState<TradeTarget | null>(null);
  const [watchedTickers, setWatchedTickers] = useState<Set<string>>(new Set());
  const [watchBusyTicker, setWatchBusyTicker] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getFollowedStocks()
      .then((follows) => {
        if (!cancelled) {
          setWatchedTickers(
            new Set(follows.map((follow) => follow.ticker.toUpperCase())),
          );
        }
      })
      .catch(() => {
        // Watchlist actions still work; empty set until user interacts.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sectors = useMemo(
    () =>
      [
        ...new Set(
          items
            .map((item) => stocksById.get(item.stock_id)?.sector)
            .filter((sector): sector is string => Boolean(sector)),
        ),
      ].sort((a, b) => collator.compare(a, b)),
    [items, stocksById],
  );

  const visibleItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const label = labelForScore(item.score);
      const sector = stocksById.get(item.stock_id)?.sector ?? "";

      if (filter !== null) {
        if (filter.type === "label" && label !== filter.label) {
          return false;
        }
        if (filter.type === "sector" && sector !== filter.sector) {
          return false;
        }
        if (
          filter.type === "highConfidence" &&
          confidenceForScore(item.score) <= 80
        ) {
          return false;
        }
      }

      if (term.length === 0) {
        return true;
      }
      return (
        item.ticker.toLowerCase().includes(term) ||
        item.company_name.toLowerCase().includes(term) ||
        sector.toLowerCase().includes(term) ||
        label.toLowerCase().includes(term)
      );
    });

    const sorted = [...filtered];
    switch (sort) {
      case "highest":
        return sorted.sort((a, b) => b.score - a.score);
      case "lowest":
        return sorted.sort((a, b) => a.score - b.score);
      case "alpha":
        return sorted.sort((a, b) =>
          collator.compare(a.company_name, b.company_name),
        );
      case "sector":
        return sorted.sort(
          (a, b) =>
            collator.compare(
              stocksById.get(a.stock_id)?.sector ?? "",
              stocksById.get(b.stock_id)?.sector ?? "",
            ) || collator.compare(a.company_name, b.company_name),
        );
      case "recommendation":
        return sorted.sort(
          (a, b) =>
            labelRank(labelForScore(a.score)) -
              labelRank(labelForScore(b.score)) || b.score - a.score,
        );
    }
  }, [items, stocksById, query, filter, sort]);

  function openDetails(item: RecommendationItem) {
    setSelected(item);
    setDrawerOpen(true);
  }

  function analyze(item: RecommendationItem) {
    router.push(openRecommendationAnalysis(item));
  }

  function openTrade(item: RecommendationItem) {
    setTradeTarget({
      stockId: item.stock_id,
      ticker: item.ticker,
      companyName: item.company_name,
      averagePrice: undefined,
      ownedQuantity: 0,
    });
  }

  function viewStock(item: RecommendationItem) {
    router.push(`/stocks?details=${encodeURIComponent(item.ticker)}`);
  }

  async function toggleWatchlist(item: RecommendationItem) {
    const ticker = item.ticker.toUpperCase();
    if (watchBusyTicker) {
      return;
    }
    const alreadyWatched = watchedTickers.has(ticker);
    setWatchBusyTicker(ticker);
    try {
      if (alreadyWatched) {
        await unfollowStock(item.ticker);
        setWatchedTickers((current) => {
          const next = new Set(current);
          next.delete(ticker);
          return next;
        });
        push(`${item.ticker} removed from watchlist`, "success");
      } else {
        await followStock(item.ticker);
        setWatchedTickers((current) => new Set(current).add(ticker));
        push(`${item.ticker} added to watchlist`, "success");
      }
    } catch (error) {
      push(getApiErrorMessage(error), "error");
    } finally {
      setWatchBusyTicker(null);
    }
  }

  const hasFilters = filter !== null || query.trim().length > 0;

  return (
    <motion.div
      variants={dashboardContainer}
      initial="hidden"
      animate="show"
      className="relative flex flex-col gap-6"
    >
      {/* subtle AI intelligence atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[400px] bg-[radial-gradient(58%_58%_at_50%_0%,rgb(167_139_250/0.06),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[400px] bg-[radial-gradient(32%_46%_at_88%_14%,rgb(52_211_153/0.04),transparent_70%)]"
      />

      <motion.div
        variants={dashboardItem}
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-ai">
            <SparkleIcon className="h-3.5 w-3.5" />
            AI analyst
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            AI Recommendations
          </h1>
          <p className="max-w-xl text-sm text-fg-muted">
            Personalized investment opportunities based on your profile and AI
            analysis.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void refresh()}
          disabled={refreshing || loading}
          className="shrink-0"
        >
          {refreshing ? (
            <>
              <Spinner className="h-3.5 w-3.5" /> Refreshing…
            </>
          ) : (
            "Refresh Recommendations"
          )}
        </Button>
      </motion.div>

      {loading ? (
        <motion.div variants={dashboardItem}>
          <RecommendationSkeleton />
        </motion.div>
      ) : error ? (
        <motion.div variants={dashboardItem}>
          <ErrorState
            title="Unable to load recommendations."
            description="The analyst service may be rate-limited. Wait a moment and try again."
            onRetry={retry}
          />
        </motion.div>
      ) : items.length === 0 ? (
        <motion.div variants={dashboardItem}>
          <Card className="flex flex-col items-center gap-4 py-16 text-center">
            <span
              aria-hidden
              className="grid h-14 w-14 place-items-center rounded-2xl bg-ai-soft text-ai"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
                <circle cx="12" cy="12" r="3.5" />
              </svg>
            </span>
            <h2 className="font-display text-xl font-semibold text-fg">
              No recommendations yet.
            </h2>
            <p className="max-w-sm text-sm text-fg-muted">
              Complete your investor profile or ask Sentellent AI for investment
              guidance to unlock personalized picks.
            </p>
            <Link href="/chat">
              <Button
                size="lg"
                className="border-transparent bg-gradient-to-r from-ai-strong to-ai px-8 text-ai-ink hover:brightness-110"
              >
                <SparkleIcon className="h-4 w-4" />
                Open AI Chat
              </Button>
            </Link>
          </Card>
        </motion.div>
      ) : (
        <>
          <motion.div variants={dashboardItem}>
            <RecommendationSummary items={items} />
          </motion.div>

          <motion.div
            variants={dashboardItem}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search ticker, company, sector or recommendation…"
              ariaLabel="Search recommendations"
            />
            <RecommendationSort value={sort} onChange={setSort} />
          </motion.div>

          <motion.div variants={dashboardItem}>
            <RecommendationFilters
              sectors={sectors}
              selected={filter}
              onSelect={setFilter}
            />
          </motion.div>

          <motion.div variants={dashboardItem}>
            {visibleItems.length === 0 ? (
              <Card className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-sm font-medium text-fg">
                  No matching recommendations.
                </p>
                <p className="max-w-sm text-sm text-fg-muted">
                  Try a different search or filter.
                </p>
                {hasFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setFilter(null);
                    }}
                  >
                    Clear filters
                  </Button>
                ) : null}
              </Card>
            ) : (
              <RecommendationGrid
                items={visibleItems}
                stocksById={stocksById}
                watchedTickers={watchedTickers}
                watchBusyTicker={watchBusyTicker}
                onView={openDetails}
                onBuy={openTrade}
                onWatchlist={(item) => {
                  void toggleWatchlist(item);
                }}
                onAnalyze={analyze}
              />
            )}
          </motion.div>
        </>
      )}

      <RecommendationDetailsDrawer
        item={selected}
        stock={selected ? stocksById.get(selected.stock_id) : undefined}
        open={drawerOpen}
        watched={
          selected
            ? watchedTickers.has(selected.ticker.toUpperCase())
            : false
        }
        watchBusy={
          selected
            ? watchBusyTicker === selected.ticker.toUpperCase()
            : false
        }
        onClose={() => setDrawerOpen(false)}
        onAnalyze={() => {
          if (selected) {
            setDrawerOpen(false);
            analyze(selected);
          }
        }}
        onBuy={() => {
          if (selected) {
            setDrawerOpen(false);
            openTrade(selected);
          }
        }}
        onViewStock={() => {
          if (selected) {
            setDrawerOpen(false);
            viewStock(selected);
          }
        }}
        onWatchlist={() => {
          if (selected) {
            void toggleWatchlist(selected);
          }
        }}
      />

      <TradeModal
        mode="buy"
        target={tradeTarget}
        open={tradeTarget !== null}
        onClose={() => setTradeTarget(null)}
        onSuccess={() => {
          // Stay on Recommendations; TradeModal already shows a success toast.
          // Portfolio / Dashboard refetch on next visit.
          setTradeTarget(null);
        }}
      />
    </motion.div>
  );
}

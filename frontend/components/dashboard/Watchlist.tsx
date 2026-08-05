"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";
import {
  POPULAR_WATCHLIST_TICKERS,
  TRENDING_WATCHLIST_TICKERS,
  resolveTickers,
} from "@/lib/market/starterContent";
import type { StockFollowRead, StockRead } from "@/lib/api/types";

interface WatchlistProps {
  watchlist: StockFollowRead[];
  stocksById: Map<number, StockRead>;
  loading: boolean;
  error: boolean;
}

function TickerCloud({
  title,
  tickers,
  stocksById,
  variant = "neutral",
}: {
  title: string;
  tickers: readonly string[];
  stocksById: Map<number, StockRead>;
  variant?: "brand" | "neutral";
}) {
  const reduceMotion = useReducedMotion();
  const resolved = resolveTickers(tickers, stocksById);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-medium uppercase tracking-widest text-fg-subtle">
        {title}
      </p>
      <motion.div
        className="flex flex-wrap gap-2"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {resolved.map((item) => (
          <motion.span
            key={item.ticker}
            variants={reduceMotion ? undefined : fadeUp}
          >
            <Link
              href={`/stocks?details=${encodeURIComponent(item.ticker)}`}
              title={item.companyName}
            >
              <Badge
                variant={variant}
                className="tnum cursor-pointer px-3 py-1 text-sm transition-transform hover:-translate-y-0.5"
              >
                {item.ticker}
              </Badge>
            </Link>
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

export function Watchlist({
  watchlist,
  stocksById,
  loading,
  error,
}: WatchlistProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Card className="flex h-full flex-col gap-4">
      {loading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-7 w-20 rounded-full" />
          ))}
        </div>
      ) : error ? (
        <p className="py-4 text-sm text-fg-muted">
          Your watchlist could not be loaded right now.
        </p>
      ) : watchlist.length === 0 ? (
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-fg">Start a watchlist</p>
            <p className="mt-1 text-sm text-fg-muted">
              Popular and trending names to explore — follow any ticker from
              Stocks or Recommendations.
            </p>
          </div>
          <TickerCloud
            title="Popular watchlist"
            tickers={POPULAR_WATCHLIST_TICKERS}
            stocksById={stocksById}
            variant="brand"
          />
          <TickerCloud
            title="Trending / suggested"
            tickers={TRENDING_WATCHLIST_TICKERS}
            stocksById={stocksById}
          />
          <Link href="/stocks" className="mt-auto">
            <Button variant="secondary" size="sm">
              Browse & follow stocks
            </Button>
          </Link>
        </div>
      ) : (
        <motion.div
          className="flex flex-wrap gap-2.5"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {watchlist.map((follow) => (
            <motion.span
              key={follow.id}
              variants={reduceMotion ? undefined : fadeUp}
            >
              <Link
                href={`/stocks?details=${encodeURIComponent(follow.ticker)}`}
              >
                <Badge
                  variant="brand"
                  className="tnum cursor-pointer gap-2 px-3 py-1 text-sm transition-[color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-brand hover:text-brand-ink hover:shadow-glow"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-soft"
                  />
                  {follow.ticker}
                </Badge>
              </Link>
            </motion.span>
          ))}
        </motion.div>
      )}

      {!loading && !error && watchlist.length > 0 ? (
        <p className="mt-auto text-xs text-fg-subtle">
          {watchlist.length}{" "}
          {watchlist.length === 1 ? "ticker" : "tickers"} followed — news and
          AI answers are prioritised for these.
        </p>
      ) : null}
    </Card>
  );
}

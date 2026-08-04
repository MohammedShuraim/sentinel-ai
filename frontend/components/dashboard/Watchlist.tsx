"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";
import type { StockFollowRead } from "@/lib/api/types";

interface WatchlistProps {
  watchlist: StockFollowRead[];
  loading: boolean;
  error: boolean;
}

export function Watchlist({ watchlist, loading, error }: WatchlistProps) {
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
        <div className="flex flex-1 flex-col items-start justify-center gap-2 py-2">
          <p className="text-sm font-medium text-fg">Watchlist is empty</p>
          <p className="text-sm text-fg-muted">
            Add tickers from AI recommendations to track them here.
          </p>
          <Link href="/recommendations" className="mt-1">
            <Button variant="secondary" size="sm">
              View recommendations
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
              <Link href="/stocks">
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

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import type { RecommendationItem, StockRead } from "@/lib/api/types";

interface RecommendationGridProps {
  items: RecommendationItem[];
  stocksById: Map<number, StockRead>;
  watchedTickers: Set<string>;
  watchBusyTicker: string | null;
  onView: (item: RecommendationItem) => void;
  onBuy: (item: RecommendationItem) => void;
  onWatchlist: (item: RecommendationItem) => void;
  onAnalyze: (item: RecommendationItem) => void;
}

export function RecommendationGrid({
  items,
  stocksById,
  watchedTickers,
  watchBusyTicker,
  onView,
  onBuy,
  onWatchlist,
  onAnalyze,
}: RecommendationGridProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {items.map((item) => (
        <motion.div
          key={item.stock_id}
          variants={reduceMotion ? undefined : fadeUp}
          className="h-full"
        >
          <RecommendationCard
            item={item}
            stock={stocksById.get(item.stock_id)}
            watched={watchedTickers.has(item.ticker.toUpperCase())}
            watchBusy={watchBusyTicker === item.ticker.toUpperCase()}
            onView={() => onView(item)}
            onBuy={() => onBuy(item)}
            onWatchlist={() => onWatchlist(item)}
            onAnalyze={() => onAnalyze(item)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

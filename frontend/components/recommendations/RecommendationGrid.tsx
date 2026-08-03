"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import type { RecommendationItem, StockRead } from "@/lib/api/types";

interface RecommendationGridProps {
  items: RecommendationItem[];
  stocksById: Map<number, StockRead>;
  onView: (item: RecommendationItem) => void;
  onAnalyze: (item: RecommendationItem) => void;
  onBuy: (item: RecommendationItem) => void;
}

export function RecommendationGrid({
  items,
  stocksById,
  onView,
  onAnalyze,
  onBuy,
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
            onView={() => onView(item)}
            onAnalyze={() => onAnalyze(item)}
            onBuy={() => onBuy(item)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { StockCard } from "@/components/stocks/StockCard";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";
import type { StockRead } from "@/lib/api/types";

export function StockGrid({
  stocks,
  onViewDetails,
}: {
  stocks: StockRead[];
  onViewDetails?: (stock: StockRead) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {stocks.map((stock) => (
        <motion.div
          key={stock.id}
          variants={reduceMotion ? undefined : fadeUp}
        >
          <StockCard stock={stock} onViewDetails={onViewDetails} />
        </motion.div>
      ))}
    </motion.div>
  );
}

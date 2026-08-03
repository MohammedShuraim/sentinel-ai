"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { EASE_OUT, fadeUp, staggerContainer } from "@/lib/motion/presets";
import { formatINR } from "@/lib/format";
import type { PortfolioRead, StockRead } from "@/lib/api/types";

const PALETTE = [
  "#34d399",
  "#60a5fa",
  "#fbbf24",
  "#fb7185",
  "#a78bfa",
  "#5eead4",
  "#f472b6",
  "#94a3b8",
];

interface AllocationChartProps {
  holdings: PortfolioRead[];
  stocksById: Map<number, StockRead>;
}

export function AllocationChart({ holdings, stocksById }: AllocationChartProps) {
  const reduceMotion = useReducedMotion();

  const entries = useMemo(() => {
    const rows = holdings.map((holding) => ({
      holding,
      stock: stocksById.get(holding.stock_id),
      invested: holding.quantity * holding.average_price,
    }));
    const total = rows.reduce((sum, row) => sum + row.invested, 0);
    return rows
      .map((row) => ({
        ...row,
        percent: total > 0 ? (row.invested / total) * 100 : 0,
      }))
      .sort((a, b) => b.invested - a.invested);
  }, [holdings, stocksById]);

  return (
    <Card className="relative flex h-full flex-col gap-5 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgb(52_211_153/0.04),transparent_65%)]"
      />

      {/* stacked allocation bar: segments cascade in left to right */}
      <div
        className="relative flex h-2.5 w-full overflow-hidden rounded-full bg-elevated"
        role="img"
        aria-label="Portfolio allocation by holding"
      >
        {entries.map((entry, index) => (
          <motion.div
            key={entry.holding.id}
            className="h-full"
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${entry.percent}%` }}
            transition={{
              duration: 0.7,
              delay: reduceMotion ? 0 : 0.15 + index * 0.09,
              ease: EASE_OUT,
            }}
            style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
          />
        ))}
      </div>

      <motion.ul
        className="relative flex flex-col divide-y divide-line/60"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {entries.map((entry, index) => (
          <motion.li
            key={entry.holding.id}
            variants={reduceMotion ? undefined : fadeUp}
            className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-200 hover:bg-white/[0.03]"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-transparent transition-shadow duration-200 group-hover:ring-white/10"
              style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
            />
            <span className="tnum min-w-0 flex-1 truncate text-sm font-medium text-fg">
              {entry.stock ? entry.stock.ticker : `Stock #${entry.holding.stock_id}`}
            </span>
            <span className="tnum text-sm text-fg-muted">
              {formatINR(entry.invested)}
            </span>
            <span className="tnum w-14 text-right text-sm font-semibold text-fg transition-colors duration-200 group-hover:text-brand">
              {entry.percent.toFixed(1)}%
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </Card>
  );
}

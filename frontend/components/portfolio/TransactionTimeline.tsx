"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";
import { formatDate, formatINR, formatQuantity } from "@/lib/format";
import type { StockRead, TransactionRead } from "@/lib/api/types";

function SideIcon({ isBuy }: { isBuy: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isBuy ? <path d="M12 19V5m0 0-5 5m5-5 5 5" /> : <path d="M12 5v14m0 0 5-5m-5 5-5-5" />}
    </svg>
  );
}

interface TransactionTimelineProps {
  transactions: TransactionRead[];
  stocksById: Map<number, StockRead>;
}

export function TransactionTimeline({
  transactions,
  stocksById,
}: TransactionTimelineProps) {
  const reduceMotion = useReducedMotion();
  const items = transactions.slice(0, 8);

  return (
    <Card className="p-0">
      <motion.ul
        className="flex flex-col"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {items.map((transaction, index) => {
          const isBuy = transaction.transaction_type === "BUY";
          const stock = stocksById.get(transaction.stock_id);
          const isLast = index === items.length - 1;
          return (
            <motion.li
              key={transaction.id}
              variants={reduceMotion ? undefined : fadeUp}
              className="relative flex gap-4 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.03]"
            >
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${
                    isBuy
                      ? "bg-profit ring-profit/10 shadow-[0_0_10px_rgb(22_199_132/0.4)]"
                      : "bg-loss ring-loss/10 shadow-[0_0_10px_rgb(251_113_133/0.35)]"
                  }`}
                />
                {!isLast ? (
                  <span
                    aria-hidden
                    className="mt-1 w-px flex-1 bg-gradient-to-b from-line to-transparent"
                  />
                ) : null}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isBuy ? "profit" : "loss"}>
                    <SideIcon isBuy={isBuy} />
                    {isBuy ? "BUY" : "SELL"}
                  </Badge>
                  <span className="tnum text-sm font-medium text-fg">
                    {stock ? stock.ticker : `Stock #${transaction.stock_id}`}
                  </span>
                  <span className="text-xs text-fg-subtle">
                    {formatDate(transaction.transaction_date)}
                  </span>
                </div>
                <p className="text-xs text-fg-muted">
                  {formatQuantity(transaction.quantity)} shares @{" "}
                  {formatINR(transaction.price)}
                </p>
              </div>

              <p
                className={`tnum shrink-0 text-sm font-semibold ${
                  isBuy ? "text-profit" : "text-loss"
                }`}
              >
                {isBuy ? "−" : "+"}
                {formatINR(transaction.quantity * transaction.price)}
              </p>
            </motion.li>
          );
        })}
      </motion.ul>
    </Card>
  );
}

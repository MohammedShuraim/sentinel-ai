"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
      {isBuy ? (
        <path d="M7 17 17 7M9 7h8v8" />
      ) : (
        <path d="M7 7l10 10M17 9v8H9" />
      )}
    </svg>
  );
}

interface RecentTransactionsProps {
  transactions: TransactionRead[];
  stocksById: Map<number, StockRead>;
  loading: boolean;
  error: boolean;
}

export function RecentTransactions({
  transactions,
  stocksById,
  loading,
  error,
}: RecentTransactionsProps) {
  const items = transactions.slice(0, 5);
  const reduceMotion = useReducedMotion();

  return (
    <Card className="flex h-full flex-col p-0">
      {loading ? (
        <ul className="flex flex-col divide-y divide-line">
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="flex items-center gap-3 px-5 py-4">
              <div className="skeleton h-6 w-12 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-3 w-20" />
              </div>
              <div className="skeleton h-4 w-20" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <p className="px-5 py-8 text-center text-sm text-fg-muted">
          Transactions could not be loaded right now.
        </p>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col gap-3 px-5 py-6">
          <Badge variant="brand" className="w-fit">
            Getting started
          </Badge>
          <p className="text-sm font-medium text-fg">
            Your activity feed will live here
          </p>
          <p className="text-sm text-fg-muted">
            After your first buy from Recommendations or Portfolio, every trade
            appears in this timeline with ticker, quantity, and price.
          </p>
          <ul className="mt-1 list-inside list-disc text-xs text-fg-subtle">
            <li>Start with AI picks that match your risk profile</li>
            <li>Use staggered entries instead of all-in buys</li>
            <li>Review allocation after each transaction</li>
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href="/recommendations">
              <Button variant="primary" size="sm">
                Buy from recommendations
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button variant="secondary" size="sm">
                View portfolio coach
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <motion.ul
          className="flex flex-col divide-y divide-line"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {items.map((transaction) => {
            const isBuy = transaction.transaction_type === "BUY";
            const stock = stocksById.get(transaction.stock_id);
            return (
              <motion.li
                key={transaction.id}
                variants={reduceMotion ? undefined : fadeUp}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-200 hover:bg-white/[0.03]"
              >
                <Badge
                  variant={isBuy ? "profit" : "loss"}
                  className="w-16 justify-center gap-1"
                >
                  <SideIcon isBuy={isBuy} />
                  {isBuy ? "BUY" : "SELL"}
                </Badge>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="tnum truncate text-sm font-medium text-fg">
                    {stock ? stock.ticker : `Stock #${transaction.stock_id}`}
                  </p>
                  <p className="text-xs text-fg-subtle">
                    {formatQuantity(transaction.quantity)} @{" "}
                    {formatINR(transaction.price)} ·{" "}
                    {formatDate(transaction.transaction_date)}
                  </p>
                </div>
                <p
                  className={`tnum shrink-0 text-sm font-semibold ${
                    isBuy ? "text-profit" : "text-loss"
                  }`}
                >
                  {formatINR(transaction.quantity * transaction.price)}
                </p>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </Card>
  );
}

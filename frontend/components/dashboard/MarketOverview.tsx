"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";
import { formatDateShort } from "@/lib/format";
import type { NewsRead, StockRead } from "@/lib/api/types";

interface MarketOverviewProps {
  news: NewsRead[];
  stocksById: Map<number, StockRead>;
  loading: boolean;
  error: boolean;
}

export function MarketOverview({
  news,
  stocksById,
  loading,
  error,
}: MarketOverviewProps) {
  const items = news.slice(0, 5);
  const reduceMotion = useReducedMotion();

  return (
    <Card className="flex h-full flex-col p-0">
      {loading ? (
        <ul className="flex flex-col divide-y divide-line">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex flex-col gap-2 px-5 py-4">
              <div className="skeleton h-4 w-11/12" />
              <div className="skeleton h-3 w-32" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <p className="px-5 py-8 text-center text-sm text-fg-muted">
          Market headlines could not be loaded right now.
        </p>
      ) : items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-fg-muted">
          No market news has been imported yet. Headlines will appear here
          once news data is synced.
        </p>
      ) : (
        <motion.ul
          className="flex flex-col divide-y divide-line"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {items.map((article) => {
            const stock = stocksById.get(article.stock_id);
            return (
              <motion.li
                key={article.id}
                variants={reduceMotion ? undefined : fadeUp}
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3.5 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.03]"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-surface text-[11px] font-semibold uppercase tracking-wide text-brand"
                  >
                    {(stock?.ticker ?? article.source).slice(0, 2)}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-fg transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-brand">
                      {article.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {stock ? (
                        <Badge variant="brand" className="tnum">
                          {stock.ticker}
                        </Badge>
                      ) : null}
                      <Badge variant="neutral">{article.source}</Badge>
                      <span className="tnum text-xs text-fg-subtle">
                        {formatDateShort(article.published_at)}
                      </span>
                      <span className="ml-auto text-xs font-medium text-brand transition-colors group-hover:text-brand-strong">
                        Read Original →
                      </span>
                    </div>
                  </div>
                </a>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </Card>
  );
}

"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { CountUp } from "@/components/common/CountUp";
import { dashboardItem } from "@/components/dashboard/Section";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";
import { MARKET_INDICES } from "@/lib/market/starterContent";
import { formatFullDate, formatINRCompact } from "@/lib/format";
import type { PortfolioSummary } from "@/lib/api/types";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

interface HeroProps {
  fullName: string;
  summary: PortfolioSummary | null;
  watchlistCount: number;
  loading: boolean;
}

export function Hero({
  fullName,
  summary,
  watchlistCount,
  loading,
}: HeroProps) {
  const firstName = fullName.trim().split(/\s+/)[0] ?? "there";
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      variants={dashboardItem}
      className="relative overflow-hidden rounded-card border border-line bg-surface p-6 shadow-card sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_85%_0%,rgb(214_40_40/0.09),transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_90%_at_8%_100%,rgb(214_40_40/0.06),transparent_65%)]"
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          className="flex flex-col gap-3"
          variants={reduceMotion ? staggerContainer : heroStagger}
          initial="hidden"
          animate="show"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium uppercase tracking-widest text-fg-subtle"
          >
            {formatFullDate(new Date())}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl"
          >
            {greeting()},{" "}
            <span className="text-gradient-brand">{firstName}</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="max-w-xl text-sm text-fg-muted"
          >
            {(summary?.total_holdings ?? 0) > 0
              ? "Here is your market briefing for today — portfolio, watchlist and what the AI analyst is seeing right now."
              : "Your command center is live — indices, movers, AI insight and featured picks are ready even before your first trade."}
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-1 flex flex-wrap items-center gap-2"
          >
            <Badge variant="brand" dot>
              AI analyst online
            </Badge>
            <Badge variant="neutral">
              {loading
                ? "Syncing watchlist…"
                : watchlistCount > 0
                  ? `${watchlistCount} ${
                      watchlistCount === 1 ? "stock" : "stocks"
                    } on watchlist`
                  : "Discover mode · popular watchlists ready"}
            </Badge>
          </motion.div>
        </motion.div>

        <div className="flex flex-col items-start gap-1 lg:items-end">
          <p className="text-xs font-medium uppercase tracking-widest text-fg-subtle">
            {(summary?.total_holdings ?? 0) > 0
              ? "Total invested"
              : MARKET_INDICES[0]?.name ?? "NIFTY 50"}
          </p>
          {loading ? (
            <div className="skeleton h-10 w-40" />
          ) : (summary?.total_holdings ?? 0) > 0 && summary ? (
            <p className="tnum font-display text-4xl font-semibold tracking-tight text-fg drop-shadow-[0_0_28px_rgb(214_40_40/0.18)]">
              <CountUp
                value={summary.total_invested}
                format={formatINRCompact}
              />
            </p>
          ) : (
            <p className="tnum font-display text-4xl font-semibold tracking-tight text-fg drop-shadow-[0_0_28px_rgb(214_40_40/0.18)]">
              {(MARKET_INDICES[0]?.value ?? 0).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
              <span
                className={
                  (MARKET_INDICES[0]?.changePct ?? 0) >= 0
                    ? "ml-2 text-lg text-profit"
                    : "ml-2 text-lg text-loss"
                }
              >
                {(MARKET_INDICES[0]?.changePct ?? 0) >= 0 ? "+" : ""}
                {(MARKET_INDICES[0]?.changePct ?? 0).toFixed(2)}%
              </span>
            </p>
          )}
          <Link
            href={
              (summary?.total_holdings ?? 0) > 0 ? "/portfolio" : "/recommendations"
            }
            className="mt-1 text-xs font-medium text-brand underline-offset-4 hover:underline"
          >
            {(summary?.total_holdings ?? 0) > 0
              ? "View portfolio breakdown"
              : "Explore AI picks to start investing"}
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

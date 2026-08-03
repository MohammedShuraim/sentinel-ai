"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ErrorState } from "@/components/common/ErrorState";
import { Section, dashboardContainer, dashboardItem } from "@/components/dashboard/Section";
import { usePortfolio, type AppliedTrade } from "@/hooks/usePortfolio";
import { PortfolioSummaryCards } from "@/components/portfolio/PortfolioSummaryCards";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { TransactionTimeline } from "@/components/portfolio/TransactionTimeline";
import { HoldingCard } from "@/components/portfolio/HoldingCard";
import { HoldingDrawer } from "@/components/portfolio/HoldingDrawer";
import { TradeModal, type TradeTarget } from "@/components/portfolio/TradeModal";
import { PortfolioSkeleton } from "@/components/portfolio/PortfolioSkeleton";
import { PortfolioEmptyState } from "@/components/portfolio/PortfolioEmptyState";
import { openStockAnalysis } from "@/lib/chat/chatNavigation";
import type { PortfolioRead } from "@/lib/api/types";

interface TradeState {
  mode: "buy" | "sell";
  target: TradeTarget;
}

export default function PortfolioPage() {
  const router = useRouter();
  const {
    holdings,
    summary,
    transactions,
    stocksById,
    loading,
    error,
    retry,
    refresh,
    applyTrade,
  } = usePortfolio();

  const [viewingHolding, setViewingHolding] = useState<PortfolioRead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [trade, setTrade] = useState<TradeState | null>(null);

  function openTrade(mode: "buy" | "sell", holding: PortfolioRead) {
    const stock = stocksById.get(holding.stock_id);
    setTrade({
      mode,
      target: {
        stockId: holding.stock_id,
        ticker: stock?.ticker ?? `#${holding.stock_id}`,
        companyName: stock?.company_name ?? `Stock #${holding.stock_id}`,
        averagePrice: holding.average_price,
        ownedQuantity: holding.quantity,
      },
    });
  }

  function openView(holding: PortfolioRead) {
    setViewingHolding(holding);
    setDrawerOpen(true);
  }

  function analyze(holding: PortfolioRead) {
    const stock = stocksById.get(holding.stock_id);
    if (stock) {
      router.push(openStockAnalysis(stock));
    }
  }

  function handleTradeSuccess(applied: AppliedTrade) {
    applyTrade(applied);
    void refresh();
  }

  const viewingStock = viewingHolding
    ? stocksById.get(viewingHolding.stock_id)
    : undefined;

  return (
    <motion.div
      variants={dashboardContainer}
      initial="hidden"
      animate="show"
      className="relative flex flex-col gap-6"
    >
      {/* subtle wealth atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[400px] bg-[radial-gradient(58%_58%_at_50%_0%,rgb(52_211_153/0.05),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[400px] bg-[radial-gradient(30%_46%_at_90%_16%,rgb(251_191_36/0.03),transparent_70%)]"
      />

      <motion.div variants={dashboardItem} className="flex flex-col gap-1.5">
        <p className="text-xs font-medium uppercase tracking-widest text-fg-subtle">
          Wealth management
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Portfolio
        </h1>
        <p className="max-w-xl text-sm text-fg-muted">
          Your holdings, allocation and trading activity.
        </p>
      </motion.div>

      {loading ? (
        <motion.div variants={dashboardItem}>
          <PortfolioSkeleton />
        </motion.div>
      ) : error ? (
        <motion.div variants={dashboardItem}>
          <ErrorState
            title="Unable to load portfolio."
            description="Your holdings could not be fetched. Check your connection and try again."
            onRetry={retry}
          />
        </motion.div>
      ) : holdings.length === 0 ? (
        <>
          <motion.div variants={dashboardItem}>
            <PortfolioEmptyState />
          </motion.div>

          {transactions.length > 0 ? (
            <motion.div variants={dashboardItem}>
              <Section title="Recent transactions">
                <TransactionTimeline
                  transactions={transactions}
                  stocksById={stocksById}
                />
              </Section>
            </motion.div>
          ) : null}
        </>
      ) : (
        <>
          <motion.div variants={dashboardItem}>
            <PortfolioSummaryCards summary={summary} />
          </motion.div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <motion.div variants={dashboardItem} className="xl:col-span-2">
              <Section title="Holdings">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {holdings.map((holding) => (
                    <HoldingCard
                      key={holding.id}
                      holding={holding}
                      stock={stocksById.get(holding.stock_id)}
                      onView={() => openView(holding)}
                      onBuy={() => openTrade("buy", holding)}
                      onSell={() => openTrade("sell", holding)}
                      onAnalyze={() => analyze(holding)}
                    />
                  ))}
                </div>
              </Section>
            </motion.div>

            <motion.div variants={dashboardItem}>
              <Section title="Allocation">
                <AllocationChart holdings={holdings} stocksById={stocksById} />
              </Section>
            </motion.div>
          </div>

          {transactions.length > 0 ? (
            <motion.div variants={dashboardItem}>
              <Section title="Recent transactions">
                <TransactionTimeline
                  transactions={transactions}
                  stocksById={stocksById}
                />
              </Section>
            </motion.div>
          ) : null}
        </>
      )}

      <HoldingDrawer
        holding={viewingHolding}
        stock={viewingStock}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAnalyze={() => {
          if (viewingHolding) {
            setDrawerOpen(false);
            analyze(viewingHolding);
          }
        }}
      />

      <TradeModal
        mode={trade?.mode ?? "buy"}
        target={trade?.target ?? null}
        open={trade !== null}
        onClose={() => setTrade(null)}
        onSuccess={handleTradeSuccess}
      />
    </motion.div>
  );
}

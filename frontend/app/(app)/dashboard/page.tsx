"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Section,
  dashboardContainer,
} from "@/components/dashboard/Section";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Hero } from "@/components/dashboard/Hero";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { MarketInsight } from "@/components/dashboard/MarketInsight";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { MarketPulse } from "@/components/dashboard/MarketPulse";
import { Watchlist } from "@/components/dashboard/Watchlist";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { RecommendationsPreview } from "@/components/dashboard/RecommendationsPreview";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function HomePage() {
  const { user } = useAuth();
  const data = useDashboardData();

  return (
    <motion.div
      variants={dashboardContainer}
      initial="hidden"
      animate="show"
      className="relative flex flex-col gap-6"
    >
      {/* subtle command-center depth: soft red overhead */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[420px] bg-[radial-gradient(58%_60%_at_50%_0%,rgb(214_40_40/0.07),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[420px] bg-[radial-gradient(34%_52%_at_92%_18%,rgb(214_40_40/0.04),transparent_70%)]"
      />
      <Hero
        fullName={user?.full_name ?? ""}
        summary={data.summary}
        watchlistCount={data.watchlist.length}
        loading={data.loading}
      />

      <KpiCards
        summary={data.summary}
        watchlistCount={data.watchlist.length}
        loading={data.loading}
      />

      <Section title="Market pulse">
        <MarketPulse />
      </Section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Section title="Today's AI market insight" className="xl:col-span-2">
          <MarketInsight
            topPick={data.recommendations[0] ?? null}
            loading={data.loading}
            error={data.errors.recommendations}
          />
        </Section>
        <Section title="Quick actions">
          <QuickActions />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Section title="Market news" className="xl:col-span-2">
          <MarketOverview
            news={data.news}
            stocksById={data.stocksById}
            loading={data.loading}
            error={data.errors.news}
          />
        </Section>
        <Section title="Watchlist" actionHref="/stocks" actionLabel="Manage">
          <Watchlist
            watchlist={data.watchlist}
            stocksById={data.stocksById}
            loading={data.loading}
            error={data.errors.watchlist}
          />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          title="Recent transactions"
          actionHref="/portfolio"
          actionLabel="View all"
        >
          <RecentTransactions
            transactions={data.transactions}
            stocksById={data.stocksById}
            loading={data.loading}
            error={data.errors.transactions}
          />
        </Section>
        <Section
          title="Recommendations preview"
          actionHref="/recommendations"
          actionLabel="View all"
        >
          <RecommendationsPreview
            recommendations={data.recommendations}
            loading={data.loading}
            error={data.errors.recommendations}
          />
        </Section>
      </div>
    </motion.div>
  );
}

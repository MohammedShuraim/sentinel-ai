"use client";

import { useEffect, useState } from "react";
import { getLatestNews } from "@/lib/api/news";
import { getPortfolioSummary } from "@/lib/api/portfolio";
import { getRecommendations } from "@/lib/api/recommendations";
import { getFollowedStocks, getStocks } from "@/lib/api/stocks";
import { getTransactions } from "@/lib/api/transactions";
import type {
  NewsRead,
  PortfolioSummary,
  RecommendationItem,
  StockFollowRead,
  StockRead,
  TransactionRead,
} from "@/lib/api/types";
import {
  PROFILE_READY_EVENT,
  TRADE_COMPLETED_EVENT,
} from "@/lib/onboarding/events";

export interface DashboardErrors {
  summary: boolean;
  transactions: boolean;
  watchlist: boolean;
  news: boolean;
  recommendations: boolean;
  stocks: boolean;
}

export interface DashboardData {
  loading: boolean;
  summary: PortfolioSummary | null;
  transactions: TransactionRead[];
  watchlist: StockFollowRead[];
  news: NewsRead[];
  recommendations: RecommendationItem[];
  stocksById: Map<number, StockRead>;
  errors: DashboardErrors;
}

const initialState: DashboardData = {
  loading: true,
  summary: null,
  transactions: [],
  watchlist: [],
  news: [],
  recommendations: [],
  stocksById: new Map(),
  errors: {
    summary: false,
    transactions: false,
    watchlist: false,
    news: false,
    recommendations: false,
    stocks: false,
  },
};

export function useDashboardData(): DashboardData {
  const [state, setState] = useState<DashboardData>(initialState);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    function onReload() {
      setReloadToken((current) => current + 1);
    }
    window.addEventListener(PROFILE_READY_EVENT, onReload);
    window.addEventListener(TRADE_COMPLETED_EVENT, onReload);
    return () => {
      window.removeEventListener(PROFILE_READY_EVENT, onReload);
      window.removeEventListener(TRADE_COMPLETED_EVENT, onReload);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [summary, transactions, watchlist, news, recommendations, stocks] =
        await Promise.allSettled([
          getPortfolioSummary(),
          getTransactions(),
          getFollowedStocks(),
          getLatestNews(),
          getRecommendations(),
          getStocks(),
        ]);

      if (cancelled) {
        return;
      }

      const stockList = stocks.status === "fulfilled" ? stocks.value : [];

      setState({
        loading: false,
        summary: summary.status === "fulfilled" ? summary.value : null,
        transactions:
          transactions.status === "fulfilled"
            ? [...transactions.value].sort(
                (a, b) =>
                  new Date(b.transaction_date).getTime() -
                  new Date(a.transaction_date).getTime(),
              )
            : [],
        watchlist: watchlist.status === "fulfilled" ? watchlist.value : [],
        news:
          news.status === "fulfilled"
            ? [...news.value].sort(
                (a, b) =>
                  new Date(b.published_at).getTime() -
                  new Date(a.published_at).getTime(),
              )
            : [],
        recommendations:
          recommendations.status === "fulfilled"
            ? recommendations.value.recommendations
            : [],
        stocksById: new Map(stockList.map((stock) => [stock.id, stock])),
        errors: {
          summary: summary.status === "rejected",
          transactions: transactions.status === "rejected",
          watchlist: watchlist.status === "rejected",
          news: news.status === "rejected",
          recommendations: recommendations.status === "rejected",
          stocks: stocks.status === "rejected",
        },
      });
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return state;
}

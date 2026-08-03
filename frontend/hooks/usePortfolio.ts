"use client";

import { useCallback, useEffect, useState } from "react";
import { getPortfolio, getPortfolioSummary } from "@/lib/api/portfolio";
import { getStocks } from "@/lib/api/stocks";
import { getTransactions } from "@/lib/api/transactions";
import type {
  PortfolioRead,
  PortfolioSummary,
  StockRead,
  TransactionRead,
} from "@/lib/api/types";

export interface AppliedTrade {
  type: "BUY" | "SELL";
  stock_id: number;
  quantity: number;
  price: number;
}

export interface UsePortfolio {
  holdings: PortfolioRead[];
  summary: PortfolioSummary | null;
  transactions: TransactionRead[];
  stocksById: Map<number, StockRead>;
  loading: boolean;
  error: boolean;
  retry: () => void;
  refresh: () => Promise<void>;
  applyTrade: (trade: AppliedTrade) => void;
}

function computeSummary(holdings: PortfolioRead[]): PortfolioSummary {
  return {
    total_holdings: holdings.length,
    total_quantity: holdings.reduce((sum, h) => sum + h.quantity, 0),
    total_invested: holdings.reduce(
      (sum, h) => sum + h.quantity * h.average_price,
      0,
    ),
  };
}

function patchHoldings(
  holdings: PortfolioRead[],
  trade: AppliedTrade,
): PortfolioRead[] {
  const index = holdings.findIndex((h) => h.stock_id === trade.stock_id);

  if (index === -1) {
    if (trade.type !== "BUY") {
      return holdings;
    }
    const now = new Date().toISOString();
    return [
      ...holdings,
      {
        id: -Date.now(),
        user_id: -1,
        stock_id: trade.stock_id,
        quantity: trade.quantity,
        average_price: trade.price,
        created_at: now,
        updated_at: now,
      },
    ];
  }

  const holding = holdings[index];

  if (trade.type === "BUY") {
    const quantity = holding.quantity + trade.quantity;
    const average_price =
      (holding.quantity * holding.average_price +
        trade.quantity * trade.price) /
      quantity;
    return holdings.map((h, i) =>
      i === index ? { ...h, quantity, average_price } : h,
    );
  }

  const quantity = holding.quantity - trade.quantity;
  if (quantity <= 1e-9) {
    return holdings.filter((_, i) => i !== index);
  }
  return holdings.map((h, i) => (i === index ? { ...h, quantity } : h));
}

function sortTransactions(items: TransactionRead[]): TransactionRead[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.transaction_date).getTime() -
      new Date(a.transaction_date).getTime(),
  );
}

export function usePortfolio(): UsePortfolio {
  const [holdings, setHoldings] = useState<PortfolioRead[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionRead[]>([]);
  const [stocksById, setStocksById] = useState<Map<number, StockRead>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [portfolio, portfolioSummary, txs, stocks] =
        await Promise.allSettled([
          getPortfolio(),
          getPortfolioSummary(),
          getTransactions(),
          getStocks(),
        ]);

      if (cancelled) {
        return;
      }

      const failed = portfolio.status === "rejected";
      setError(failed);

      if (portfolio.status === "fulfilled") {
        setHoldings(portfolio.value);
      }
      if (portfolioSummary.status === "fulfilled") {
        setSummary(portfolioSummary.value);
      }
      if (txs.status === "fulfilled") {
        setTransactions(sortTransactions(txs.value));
      }
      if (stocks.status === "fulfilled") {
        setStocksById(new Map(stocks.value.map((s) => [s.id, s])));
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(false);
    setAttempt((current) => current + 1);
  }, []);

  const refresh = useCallback(async () => {
    const [portfolio, portfolioSummary, txs] = await Promise.allSettled([
      getPortfolio(),
      getPortfolioSummary(),
      getTransactions(),
    ]);
    if (portfolio.status === "fulfilled") {
      setHoldings(portfolio.value);
    }
    if (portfolioSummary.status === "fulfilled") {
      setSummary(portfolioSummary.value);
    }
    if (txs.status === "fulfilled") {
      setTransactions(sortTransactions(txs.value));
    }
  }, []);

  const applyTrade = useCallback((trade: AppliedTrade) => {
    setHoldings((current) => {
      const next = patchHoldings(current, trade);
      queueMicrotask(() => setSummary(computeSummary(next)));
      return next;
    });
    const now = new Date().toISOString();
    setTransactions((current) =>
      [
        {
          id: -Date.now(),
          user_id: -1,
          stock_id: trade.stock_id,
          transaction_type: trade.type,
          quantity: trade.quantity,
          price: trade.price,
          transaction_date: now,
          created_at: now,
        },
        ...current,
      ].slice(0, 50),
    );
  }, []);

  return {
    holdings,
    summary,
    transactions,
    stocksById,
    loading,
    error,
    retry,
    refresh,
    applyTrade,
  };
}

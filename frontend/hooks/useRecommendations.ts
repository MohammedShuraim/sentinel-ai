"use client";

import { useCallback, useEffect, useState } from "react";
import { getRecommendations } from "@/lib/api/recommendations";
import { getStocks } from "@/lib/api/stocks";
import type { RecommendationItem, StockRead } from "@/lib/api/types";
import { PROFILE_READY_EVENT } from "@/lib/onboarding/events";

export interface UseRecommendations {
  items: RecommendationItem[];
  stocksById: Map<number, StockRead>;
  loading: boolean;
  refreshing: boolean;
  error: boolean;
  retry: () => void;
  refresh: () => Promise<void>;
}

export function useRecommendations(): UseRecommendations {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [stocksById, setStocksById] = useState<Map<number, StockRead>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [recommendations, stocks] = await Promise.allSettled([
        getRecommendations(),
        getStocks(),
      ]);

      if (cancelled) {
        return;
      }

      setError(recommendations.status === "rejected");
      if (recommendations.status === "fulfilled") {
        setItems(recommendations.value.recommendations);
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
    setRefreshing(true);
    try {
      const data = await getRecommendations();
      setItems(data.recommendations);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    function onProfileReady() {
      void refresh();
    }
    window.addEventListener(PROFILE_READY_EVENT, onProfileReady);
    return () => {
      window.removeEventListener(PROFILE_READY_EVENT, onProfileReady);
    };
  }, [refresh]);

  return { items, stocksById, loading, refreshing, error, retry, refresh };
}

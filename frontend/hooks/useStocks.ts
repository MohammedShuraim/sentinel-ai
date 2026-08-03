"use client";

import { useCallback, useEffect, useState } from "react";
import { getStocks } from "@/lib/api/stocks";
import type { StockRead } from "@/lib/api/types";

export interface UseStocksResult {
  stocks: StockRead[];
  loading: boolean;
  error: boolean;
  retry: () => void;
}

export function useStocks(): UseStocksResult {
  const [stocks, setStocks] = useState<StockRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getStocks()
      .then((data) => {
        if (!cancelled) {
          setStocks(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(false);
    setAttempt((current) => current + 1);
  }, []);

  return { stocks, loading, error, retry };
}

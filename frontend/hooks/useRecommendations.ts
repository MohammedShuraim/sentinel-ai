"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRecommendations } from "@/lib/api/recommendations";
import { getStocks } from "@/lib/api/stocks";
import type { RecommendationItem, StockRead } from "@/lib/api/types";
import type { GenerationStageIndex } from "@/components/recommendations/RecommendationGeneratingState";
import {
  PROFILE_READY_EVENT,
  consumeRecommendationsPending,
  peekRecommendationsPending,
} from "@/lib/onboarding/events";

export interface UseRecommendations {
  items: RecommendationItem[];
  stocksById: Map<number, StockRead>;
  loading: boolean;
  generating: boolean;
  /** True when this load was kicked off by onboarding / fresh navigation. */
  fromOnboarding: boolean;
  generationStage: GenerationStageIndex;
  refreshing: boolean;
  error: boolean;
  emptyReason: string | null;
  retry: () => void;
  refresh: () => Promise<void>;
}

function isFreshNavigation(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return new URLSearchParams(window.location.search).get("fresh") === "1";
  } catch {
    return false;
  }
}

/** Minimum time to show each generation stage (ms). */
const STAGE_DWELL_MS = [900, 1100, 1200, 900] as const;

export function useRecommendations(): UseRecommendations {
  const initialOnboarding =
    peekRecommendationsPending() || isFreshNavigation();

  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [stocksById, setStocksById] = useState<Map<number, StockRead>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(initialOnboarding);
  const [fromOnboarding, setFromOnboarding] = useState(initialOnboarding);
  const [generationStage, setGenerationStage] =
    useState<GenerationStageIndex>(initialOnboarding ? 0 : 1);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [emptyReason, setEmptyReason] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const stageTimersRef = useRef<number[]>([]);
  const fetchDoneRef = useRef(false);
  const minStagesDoneRef = useRef(false);

  const clearStageTimers = useCallback(() => {
    for (const id of stageTimersRef.current) {
      window.clearTimeout(id);
    }
    stageTimersRef.current = [];
  }, []);

  const finishLoadingUi = useCallback(() => {
    if (!fetchDoneRef.current || !minStagesDoneRef.current) {
      return;
    }
    setLoading(false);
    setGenerating(false);
    if (typeof window !== "undefined" && isFreshNavigation()) {
      const url = new URL(window.location.href);
      url.searchParams.delete("fresh");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, []);

  const startStageProgression = useCallback(
    (onboarding: boolean) => {
      clearStageTimers();
      fetchDoneRef.current = false;
      minStagesDoneRef.current = false;

      const startStage: GenerationStageIndex = onboarding ? 0 : 1;
      setGenerationStage(startStage);

      let elapsed = 0;
      const stages: GenerationStageIndex[] = onboarding
        ? [0, 1, 2, 3]
        : [1, 2, 3];

      for (let i = 1; i < stages.length; i += 1) {
        const prev = stages[i - 1];
        elapsed += STAGE_DWELL_MS[prev];
        const next = stages[i];
        const timer = window.setTimeout(() => {
          setGenerationStage(next);
        }, elapsed);
        stageTimersRef.current.push(timer);
      }

      const last = stages[stages.length - 1];
      const totalMin =
        elapsed + STAGE_DWELL_MS[last];
      const doneTimer = window.setTimeout(() => {
        minStagesDoneRef.current = true;
        finishLoadingUi();
      }, totalMin);
      stageTimersRef.current.push(doneTimer);
    },
    [clearStageTimers, finishLoadingUi],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const onboarding =
        consumeRecommendationsPending() || isFreshNavigation();
      setFromOnboarding(onboarding);
      setGenerating(true);
      setLoading(true);
      setError(false);
      startStageProgression(onboarding);

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
        setEmptyReason(recommendations.value.empty_reason ?? null);
      } else {
        setItems([]);
        setEmptyReason(
          "The recommendation service failed to respond. Please try again.",
        );
      }
      if (stocks.status === "fulfilled") {
        setStocksById(new Map(stocks.value.map((s) => [s.id, s])));
      }

      fetchDoneRef.current = true;
      // Jump to final stage once the API responds; UI still waits for dwell.
      setGenerationStage(3);
      finishLoadingUi();
    }

    void load();

    return () => {
      cancelled = true;
      clearStageTimers();
    };
  }, [attempt, startStageProgression, finishLoadingUi, clearStageTimers]);

  const retry = useCallback(() => {
    setLoading(true);
    setGenerating(true);
    setFromOnboarding(true);
    setError(false);
    setEmptyReason(null);
    setAttempt((current) => current + 1);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setGenerating(true);
    setFromOnboarding(false);
    setLoading(true);
    startStageProgression(false);
    try {
      const data = await getRecommendations();
      setItems(data.recommendations);
      setEmptyReason(data.empty_reason ?? null);
      setError(false);
    } catch {
      setError(true);
      setItems([]);
      setEmptyReason(
        "The recommendation service failed to respond. Please try again.",
      );
    } finally {
      fetchDoneRef.current = true;
      setGenerationStage(3);
      setRefreshing(false);
      finishLoadingUi();
    }
  }, [startStageProgression, finishLoadingUi]);

  useEffect(() => {
    function onProfileReady() {
      void refresh();
    }
    window.addEventListener(PROFILE_READY_EVENT, onProfileReady);
    return () => {
      window.removeEventListener(PROFILE_READY_EVENT, onProfileReady);
    };
  }, [refresh]);

  return {
    items,
    stocksById,
    loading,
    generating,
    fromOnboarding,
    generationStage,
    refreshing,
    error,
    emptyReason,
    retry,
    refresh,
  };
}

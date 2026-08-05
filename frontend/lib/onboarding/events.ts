/** Dispatched after onboarding saves investor preferences successfully. */
export const PROFILE_READY_EVENT = "sentellent:profile-ready";

/** Dispatched after a successful buy/sell so Portfolio / Dashboard can refresh. */
export const TRADE_COMPLETED_EVENT = "sentellent:trade-completed";

const PENDING_RECS_KEY = "sentellent:pending-recommendations";

/** Mark that onboarding just finished — Recommendations must generate next. */
export function markRecommendationsPending(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(PENDING_RECS_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function consumeRecommendationsPending(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const pending = window.sessionStorage.getItem(PENDING_RECS_KEY) === "1";
    if (pending) {
      window.sessionStorage.removeItem(PENDING_RECS_KEY);
    }
    return pending;
  } catch {
    return false;
  }
}

export function peekRecommendationsPending(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.sessionStorage.getItem(PENDING_RECS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dispatchProfileReady(): void {
  if (typeof window === "undefined") {
    return;
  }
  markRecommendationsPending();
  window.dispatchEvent(new Event(PROFILE_READY_EVENT));
}

export function dispatchTradeCompleted(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(TRADE_COMPLETED_EVENT));
}

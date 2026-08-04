/** Dispatched after onboarding saves investor preferences successfully. */
export const PROFILE_READY_EVENT = "sentellent:profile-ready";

/** Dispatched after a successful buy/sell so Portfolio / Dashboard can refresh. */
export const TRADE_COMPLETED_EVENT = "sentellent:trade-completed";

export function dispatchProfileReady(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(PROFILE_READY_EVENT));
}

export function dispatchTradeCompleted(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(TRADE_COMPLETED_EVENT));
}

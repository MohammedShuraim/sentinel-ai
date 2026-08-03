/** Dispatched after onboarding saves investor preferences successfully. */
export const PROFILE_READY_EVENT = "sentellent:profile-ready";

export function dispatchProfileReady(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(PROFILE_READY_EVENT));
}

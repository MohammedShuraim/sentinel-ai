import type { BadgeVariant } from "@/components/ui/Badge";

/**
 * The backend RecommendationService.score_stock() awards:
 * +3 sector match, +2 dividend, +2 risk, +2 style, +1 market cap,
 * and +2 / 0 / -3 from news sentiment. Maximum achievable = 12.
 */
export const MAX_RECOMMENDATION_SCORE = 12;

export const RECOMMENDATION_LABELS = [
  "Strong Buy",
  "Buy",
  "Hold",
  "Sell",
] as const;

export type RecommendationLabel = (typeof RECOMMENDATION_LABELS)[number];

export function confidenceForScore(score: number): number {
  return Math.min(
    100,
    Math.max(0, Math.round((score / MAX_RECOMMENDATION_SCORE) * 100)),
  );
}

export function labelForScore(score: number): RecommendationLabel {
  const confidence = confidenceForScore(score);
  if (confidence >= 75) {
    return "Strong Buy";
  }
  if (confidence >= 50) {
    return "Buy";
  }
  if (confidence >= 30) {
    return "Hold";
  }
  return "Sell";
}

export function labelVariant(label: RecommendationLabel): BadgeVariant {
  switch (label) {
    case "Strong Buy":
      return "profit";
    case "Buy":
      return "brand";
    case "Hold":
      return "warn";
    case "Sell":
      return "loss";
  }
}

export const LABEL_ACCENTS: Record<RecommendationLabel, string> = {
  "Strong Buy": "#10b981",
  Buy: "#34d399",
  Hold: "#fbbf24",
  Sell: "#fb7185",
};

export function labelRank(label: RecommendationLabel): number {
  return RECOMMENDATION_LABELS.indexOf(label);
}

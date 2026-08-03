import { apiClient } from "@/lib/api/client";
import type { RecommendationResponse } from "@/lib/api/types";

export async function getRecommendations(): Promise<RecommendationResponse> {
  const { data } = await apiClient.get<RecommendationResponse>(
    "/recommendations/",
  );
  return data;
}

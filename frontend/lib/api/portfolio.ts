import { apiClient } from "@/lib/api/client";
import type { PortfolioRead, PortfolioSummary } from "@/lib/api/types";

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const { data } = await apiClient.get<PortfolioSummary>("/portfolio/summary");
  return data;
}

export async function getPortfolio(): Promise<PortfolioRead[]> {
  const { data } = await apiClient.get<PortfolioRead[]>("/portfolio/");
  return data;
}

import { apiClient } from "@/lib/api/client";
import type { StockFollowRead, StockRead } from "@/lib/api/types";

export async function getFollowedStocks(): Promise<StockFollowRead[]> {
  const { data } = await apiClient.get<StockFollowRead[]>("/stocks/my-stocks");
  return data;
}

export async function followStock(ticker: string): Promise<StockFollowRead> {
  const { data } = await apiClient.post<StockFollowRead>("/stocks/follow", {
    ticker,
  });
  return data;
}

export async function unfollowStock(ticker: string): Promise<void> {
  await apiClient.delete(`/stocks/unfollow/${encodeURIComponent(ticker)}`);
}

export async function getStocks(): Promise<StockRead[]> {
  const { data } = await apiClient.get<StockRead[]>("/stocks/");
  return data;
}

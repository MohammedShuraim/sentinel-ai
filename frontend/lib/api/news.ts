import { apiClient } from "@/lib/api/client";
import type { NewsRead } from "@/lib/api/types";

export async function getLatestNews(): Promise<NewsRead[]> {
  const { data } = await apiClient.get<NewsRead[]>("/news/");
  return data;
}

export async function getStockNews(ticker: string): Promise<NewsRead[]> {
  const { data } = await apiClient.get<NewsRead[]>(
    `/news/${encodeURIComponent(ticker)}`,
  );
  return data;
}

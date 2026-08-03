import { apiClient } from "@/lib/api/client";
import type { TransactionRead } from "@/lib/api/types";

export async function getTransactions(): Promise<TransactionRead[]> {
  const { data } = await apiClient.get<TransactionRead[]>("/transactions/");
  return data;
}

export interface TradePayload {
  stock_id: number;
  quantity: number;
  price: number;
}

export async function buyStock(payload: TradePayload): Promise<TransactionRead> {
  const { data } = await apiClient.post<TransactionRead>("/transactions/buy", {
    ...payload,
    transaction_type: "BUY",
  });
  return data;
}

export async function sellStock(
  payload: TradePayload,
): Promise<TransactionRead> {
  const { data } = await apiClient.post<TransactionRead>("/transactions/sell", {
    ...payload,
    transaction_type: "SELL",
  });
  return data;
}

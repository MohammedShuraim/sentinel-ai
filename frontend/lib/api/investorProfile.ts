import { apiClient } from "@/lib/api/client";
import type {
  InvestorProfileRead,
  InvestorProfileUpdate,
} from "@/lib/api/types";

export async function getInvestorProfile(): Promise<InvestorProfileRead> {
  const { data } = await apiClient.get<InvestorProfileRead>("/investor-profile/");
  return data;
}

export async function updateInvestorProfile(
  payload: InvestorProfileUpdate,
): Promise<InvestorProfileRead> {
  const { data } = await apiClient.put<InvestorProfileRead>(
    "/investor-profile/",
    payload,
  );
  return data;
}

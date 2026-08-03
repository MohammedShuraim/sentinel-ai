import { apiClient } from "@/lib/api/client";
import type { UserRead } from "@/lib/api/types";

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload): Promise<UserRead> {
  const { data } = await apiClient.post<UserRead>("/users/", payload);
  return data;
}

export async function getCurrentUser(): Promise<UserRead> {
  const { data } = await apiClient.get<UserRead>("/users/me");
  return data;
}

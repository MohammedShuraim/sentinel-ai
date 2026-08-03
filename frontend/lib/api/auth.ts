import { API_BASE_URL } from "@/lib/env";
import { apiClient } from "@/lib/api/client";
import type { Token } from "@/lib/api/types";

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<Token> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const { data } = await apiClient.post<Token>("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export function getGoogleLoginUrl(): string {
  return `${API_BASE_URL}/auth/google/login`;
}

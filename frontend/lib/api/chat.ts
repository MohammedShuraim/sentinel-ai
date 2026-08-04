import { apiClient } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/env";
import { getToken, clearToken } from "@/lib/auth/token";
import type {
  ActiveConversationResponse,
  ChatRequest,
  ChatResponse,
  RetrievedDocument,
} from "@/lib/api/types";

export async function sendChatMessage(
  payload: ChatRequest,
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/chat/", payload);
  return data;
}

export async function getActiveConversation(): Promise<ActiveConversationResponse> {
  const { data } = await apiClient.get<ActiveConversationResponse>("/chat/active");
  return data;
}

export type ChatStreamHandlers = {
  signal?: AbortSignal;
  onStart?: (conversationId: number) => void;
  onToken?: (delta: string) => void;
  onDone?: (payload: {
    conversation_id: number;
    answer: string;
    sources: RetrievedDocument[];
  }) => void;
  onError?: (detail: string) => void;
};

type StreamEvent =
  | { type: "start"; conversation_id: number }
  | { type: "token"; delta: string }
  | {
      type: "done";
      conversation_id: number;
      answer: string;
      sources: RetrievedDocument[];
    }
  | { type: "error"; detail: string };

/**
 * Consume POST /chat/stream as Server-Sent Events via Fetch + ReadableStream.
 * Replaces Axios for streaming chat only.
 */
export async function streamChatMessage(
  payload: ChatRequest,
  handlers: ChatStreamHandlers = {},
): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    signal: handlers.signal,
  });

  if (response.status === 401) {
    clearToken();
    handlers.onError?.("Unauthorized. Please sign in again.");
    throw new Error("Unauthorized");
  }

  if (!response.ok || !response.body) {
    handlers.onError?.("The AI analyst is temporarily unavailable.");
    throw new Error(`Chat stream failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sawTerminal = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const dataLine = part
        .split("\n")
        .map((line) => line.trimEnd())
        .find((line) => line.startsWith("data:"));
      if (!dataLine) {
        continue;
      }

      const raw = dataLine.slice(5).trim();
      if (!raw || raw === "[DONE]") {
        continue;
      }

      let event: StreamEvent;
      try {
        event = JSON.parse(raw) as StreamEvent;
      } catch {
        continue;
      }

      if (event.type === "start") {
        handlers.onStart?.(event.conversation_id);
      } else if (event.type === "token") {
        handlers.onToken?.(event.delta);
      } else if (event.type === "done") {
        sawTerminal = true;
        handlers.onDone?.({
          conversation_id: event.conversation_id,
          answer: event.answer,
          sources: event.sources ?? [],
        });
      } else if (event.type === "error") {
        sawTerminal = true;
        handlers.onError?.(
          event.detail || "The AI analyst is temporarily unavailable.",
        );
        throw new Error(event.detail || "Chat stream error");
      }
    }
  }

  if (!sawTerminal) {
    handlers.onError?.("The AI analyst is temporarily unavailable.");
    throw new Error("Chat stream ended without a terminal event");
  }
}

import type { ChatMessage } from "@/lib/chat/types";

const STORAGE_KEY = "sentellent_chat_session";

export interface ChatSession {
  messages: ChatMessage[];
  conversationId: number | null;
}

/**
 * Client cache for instant paint across SPA navigations.
 * Authoritative history lives in the backend DB (`GET /chat/active`).
 */
let memorySession: ChatSession = {
  messages: [],
  conversationId: null,
};

function readStorage(): ChatSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as ChatSession;
    if (!Array.isArray(parsed.messages)) {
      return null;
    }
    return {
      messages: parsed.messages,
      conversationId:
        typeof parsed.conversationId === "number"
          ? parsed.conversationId
          : null,
    };
  } catch {
    return null;
  }
}

function writeStorage(session: ChatSession): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore quota / private-mode failures; memory session still works.
  }
}

export function getChatSession(): ChatSession {
  if (memorySession.messages.length > 0 || memorySession.conversationId) {
    return memorySession;
  }
  const stored = readStorage();
  if (stored) {
    memorySession = stored;
  }
  return memorySession;
}

export function setChatSession(session: ChatSession): void {
  memorySession = session;
  writeStorage(session);
}

export function clearChatSession(): void {
  memorySession = { messages: [], conversationId: null };
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

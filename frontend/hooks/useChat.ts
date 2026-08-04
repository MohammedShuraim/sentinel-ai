"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getActiveConversation, streamChatMessage } from "@/lib/api/chat";
import { getChatSession, setChatSession } from "@/lib/chat/chatStore";
import type { ChatMessage } from "@/lib/chat/types";
import type { ChatMessageRead } from "@/lib/api/types";

export type { ChatMessage } from "@/lib/chat/types";

let messageCounter = 0;

function nextMessageId(): string {
  messageCounter += 1;
  return `m-${Date.now().toString(36)}-${messageCounter}`;
}

function mapPersistedMessage(message: ChatMessageRead): ChatMessage | null {
  if (message.role !== "user" && message.role !== "assistant") {
    return null;
  }
  return {
    id: `db-${message.id}`,
    role: message.role,
    content: message.content,
  };
}

const AI_UNAVAILABLE_MESSAGE =
  "The AI analyst is temporarily unavailable. Please try again in a moment.";

export interface UseChat {
  messages: ChatMessage[];
  conversationId: number | null;
  sending: boolean;
  send: (question: string) => Promise<void>;
  regenerate: () => void;
}

export function useChat(): UseChat {
  const initial = getChatSession();
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [conversationId, setConversationId] = useState<number | null>(
    initial.conversationId,
  );
  const [sending, setSending] = useState(false);

  const sendingRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>(initial.messages);
  const conversationIdRef = useRef<number | null>(initial.conversationId);
  const abortRef = useRef<AbortController | null>(null);

  const persist = useCallback(
    (nextMessages: ChatMessage[], nextConversationId: number | null) => {
      messagesRef.current = nextMessages;
      conversationIdRef.current = nextConversationId;
      setMessages(nextMessages);
      setConversationId(nextConversationId);
      setChatSession({
        messages: nextMessages,
        conversationId: nextConversationId,
      });
    },
    [],
  );

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Hydrate from DB so refresh / new tab restores the ongoing conversation.
  // Keep a local cache only when it is ahead of the API (SPA nav / in-flight).
  useEffect(() => {
    let cancelled = false;

    async function hydrateFromBackend() {
      try {
        const active = await getActiveConversation();
        if (cancelled || sendingRef.current) {
          return;
        }

        const mapped = active.messages
          .map(mapPersistedMessage)
          .filter((message): message is ChatMessage => message !== null);

        const localId = conversationIdRef.current;
        const localCount = messagesRef.current.length;
        const sameConversation =
          active.conversation_id != null &&
          localId != null &&
          active.conversation_id === localId;

        if (sameConversation && localCount >= mapped.length) {
          return;
        }

        if (active.conversation_id == null && localCount > 0) {
          return;
        }

        persist(mapped, active.conversation_id);
      } catch {
        // Keep whatever is already in the local session cache.
      }
    }

    void hydrateFromBackend();
    return () => {
      cancelled = true;
    };
  }, [persist]);

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || sendingRef.current) {
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      sendingRef.current = true;
      setSending(true);

      const userMessage: ChatMessage = {
        id: nextMessageId(),
        role: "user",
        content: question,
      };
      const assistantId = nextMessageId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
      };
      const withUser = [...messagesRef.current, userMessage, assistantMessage];
      persist(withUser, conversationIdRef.current);

      const patchAssistant = (patch: Partial<ChatMessage>) => {
        const next = messagesRef.current.map((message) =>
          message.id === assistantId ? { ...message, ...patch } : message,
        );
        persist(next, conversationIdRef.current);
      };

      try {
        await streamChatMessage(
          {
            question,
            conversation_id: conversationIdRef.current,
          },
          {
            signal: controller.signal,
            onStart: (id) => {
              conversationIdRef.current = id;
              setConversationId(id);
              setChatSession({
                messages: messagesRef.current,
                conversationId: id,
              });
            },
            onToken: (delta) => {
              const current = messagesRef.current.find(
                (message) => message.id === assistantId,
              );
              patchAssistant({
                content: `${current?.content ?? ""}${delta}`,
              });
            },
            onDone: ({ conversation_id, answer, sources }) => {
              conversationIdRef.current = conversation_id;
              persist(
                messagesRef.current.map((message) =>
                  message.id === assistantId
                    ? { ...message, content: answer, sources }
                    : message,
                ),
                conversation_id,
              );
            },
            onError: (detail) => {
              patchAssistant({
                content: detail || AI_UNAVAILABLE_MESSAGE,
                sources: undefined,
              });
            },
          },
        );
      } catch (error) {
        if (controller.signal.aborted) {
          const withoutEmptyAssistant = messagesRef.current.filter(
            (message) =>
              !(message.id === assistantId && message.content.trim() === ""),
          );
          if (withoutEmptyAssistant !== messagesRef.current) {
            const current = messagesRef.current.find(
              (m) => m.id === assistantId,
            );
            if (!current || current.content.trim() === "") {
              persist(withoutEmptyAssistant, conversationIdRef.current);
            }
          }
        } else {
          const current = messagesRef.current.find(
            (m) => m.id === assistantId,
          );
          if (!current?.content) {
            patchAssistant({ content: AI_UNAVAILABLE_MESSAGE });
          }
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        sendingRef.current = false;
        setSending(false);
      }
    },
    [persist],
  );

  const regenerate = useCallback(() => {
    if (sendingRef.current) {
      abortRef.current?.abort();
    }
    const current = messagesRef.current;
    const lastUserIndex = current.reduce(
      (found, message, index) => (message.role === "user" ? index : found),
      -1,
    );
    if (lastUserIndex === -1) {
      return;
    }
    const question = current[lastUserIndex].content;
    const trimmed = current.slice(0, lastUserIndex);
    persist(trimmed, conversationIdRef.current);
    void send(question);
  }, [persist, send]);

  return { messages, conversationId, sending, send, regenerate };
}

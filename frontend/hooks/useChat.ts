"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { streamChatMessage } from "@/lib/api/chat";
import type { ChatMessage } from "@/lib/chat/types";

export type { ChatMessage } from "@/lib/chat/types";

let messageCounter = 0;

function nextMessageId(): string {
  messageCounter += 1;
  return `m-${Date.now().toString(36)}-${messageCounter}`;
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const sendingRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  const conversationIdRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // No abort-on-unmount: React StrictMode runs effect cleanups immediately
  // after setup in dev, which would cancel the auto-sent stream before it
  // reaches the network. Superseded requests are aborted explicitly in
  // send() and regenerate() instead.

  const send = useCallback(async (raw: string) => {
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
    messagesRef.current = withUser;
    setMessages(withUser);

    const patchAssistant = (patch: Partial<ChatMessage>) => {
      const next = messagesRef.current.map((message) =>
        message.id === assistantId ? { ...message, ...patch } : message,
      );
      messagesRef.current = next;
      setMessages(next);
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
            setConversationId(conversation_id);
            patchAssistant({
              content: answer,
              sources,
            });
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
        // Keep partial answer if the user navigated away mid-stream.
        if (withoutEmptyAssistant !== messagesRef.current) {
          const current = messagesRef.current.find((m) => m.id === assistantId);
          if (!current || current.content.trim() === "") {
            messagesRef.current = withoutEmptyAssistant;
            setMessages(withoutEmptyAssistant);
          }
        }
      } else {
        const current = messagesRef.current.find((m) => m.id === assistantId);
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
  }, []);

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
    messagesRef.current = trimmed;
    setMessages(trimmed);
    void send(question);
  }, [send]);

  return { messages, conversationId, sending, send, regenerate };
}

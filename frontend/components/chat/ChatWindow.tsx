"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Markdown } from "@/components/chat/Markdown";
import { SourceCards } from "@/components/chat/SourceCards";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { MessageActions } from "@/components/chat/MessageActions";
import { FollowUpChips } from "@/components/chat/FollowUpChips";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { SparkIcon } from "@/components/common/icons";
import { suggestFollowUps } from "@/lib/chat/followUps";
import type { ChatMessage } from "@/hooks/useChat";

function AiAvatar() {
  return (
    <span
      aria-hidden
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-ai-strong to-ai text-ai-ink shadow-[0_0_14px_rgb(139_92_246/0.3)] ring-1 ring-ai/40"
    >
      <SparkIcon className="h-4 w-4" />
    </span>
  );
}

const MessageItem = memo(function MessageItem({
  message,
  isLastAssistant,
  sending,
  streaming,
  onRegenerate,
}: {
  message: ChatMessage;
  isLastAssistant: boolean;
  sending: boolean;
  streaming: boolean;
  onRegenerate: () => void;
}) {
  if (message.role === "user") {
    return (
      <li className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md border border-brand/30 bg-gradient-to-br from-brand/25 to-brand/10 px-4.5 py-3 text-sm leading-relaxed text-fg shadow-[0_0_22px_rgb(52_211_153/0.12)] sm:max-w-[75%]">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3">
      <AiAvatar />
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-md border border-line/60 bg-surface/70 px-5 py-4 shadow-[0_8px_24px_rgb(0_0_0/0.25)] backdrop-blur-md">
          <div className={streaming && isLastAssistant ? "streaming-cursor" : undefined}>
            <Markdown content={message.content} />
          </div>
          {message.sources ? <SourceCards sources={message.sources} /> : null}
        </div>
        <MessageActions
          content={message.content}
          isLast={isLastAssistant}
          sending={sending}
          onRegenerate={onRegenerate}
        />
      </div>
    </li>
  );
});

export function ChatWindow({
  messages,
  sending,
  onSend,
  onRegenerate,
}: {
  messages: ChatMessage[];
  sending: boolean;
  onSend: (question: string) => void;
  onRegenerate: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastAssistantId = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === "assistant") {
        return messages[index].id;
      }
    }
    return null;
  }, [messages]);

  const followUps = useMemo(
    () => (sending ? [] : suggestFollowUps(messages)),
    [messages, sending],
  );

  const showTyping = useMemo(() => {
    if (!sending) {
      return false;
    }
    const last = messages[messages.length - 1];
    // Hide the typing dots once the first streamed token arrives.
    return !(last?.role === "assistant" && last.content.length > 0);
  }, [messages, sending]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight });
    }
  }, [messages, sending]);

  return (
    <div
      ref={scrollRef}
      aria-live="polite"
      aria-label="Conversation with the AI analyst"
      className="flex-1 overflow-y-auto rounded-card border border-line bg-surface p-5 sm:p-7"
    >
      {messages.length === 0 && !sending ? (
        <ChatEmptyState onPrompt={onSend} />
      ) : (
        <>
          <ul className="flex flex-col gap-6">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isLastAssistant={message.id === lastAssistantId}
                sending={sending}
                streaming={sending}
                onRegenerate={onRegenerate}
              />
            ))}
            <AnimatePresence>
              {showTyping ? <TypingIndicator /> : null}
            </AnimatePresence>
          </ul>
          {followUps.length > 0 ? (
            <div className="mt-4">
              <FollowUpChips
                suggestions={followUps}
                disabled={sending}
                onSelect={onSend}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

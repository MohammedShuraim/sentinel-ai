"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { SparkIcon } from "@/components/common/icons";
import { useToast } from "@/components/providers/ToastProvider";
import { useChat } from "@/hooks/useChat";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSkeleton } from "@/components/chat/ChatSkeleton";
import {
  buildRecommendationAnalysisPrompt,
  buildStockAnalysisPrompt,
} from "@/lib/chat/chatNavigation";
import { copyToClipboard } from "@/lib/utils/clipboard";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const { messages, conversationId, sending, send, regenerate } = useChat();

  const [mounted, setMounted] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    const stock = searchParams.get("stock");
    const query = searchParams.get("query");
    if (!stock && !query) {
      return;
    }
    initializedRef.current = true;

    const name = searchParams.get("name") ?? stock ?? "";
    const prompt =
      query ??
      (searchParams.get("intent") === "recommendation"
        ? buildRecommendationAnalysisPrompt(stock ?? "", name)
        : buildStockAnalysisPrompt(stock ?? "", name));

    router.replace("/chat");
    void send(prompt);
  }, [searchParams, router, send]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "c") {
        const selection = window.getSelection()?.toString();
        if (selection) {
          return;
        }
        const lastAssistant = [...messages]
          .reverse()
          .find((message) => message.role === "assistant");
        if (!lastAssistant) {
          return;
        }
        event.preventDefault();
        void copyToClipboard(lastAssistant.content).then((ok) => {
          push(
            ok ? "Copied" : "Copy failed — clipboard unavailable",
            ok ? "success" : "error",
          );
        });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [messages, push]);

  return (
    <div className="relative flex h-[calc(100dvh-var(--spacing-topnav)-3.5rem)] flex-col items-center gap-3">
      {/* subtle AI workspace atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[380px] bg-[radial-gradient(55%_55%_at_50%_0%,rgb(214_40_40/0.08),transparent_70%)]"
      />

      <div className="flex w-full max-w-4xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-strong text-brand-ink shadow-[0_0_18px_rgb(214_40_40/0.35)] ring-1 ring-brand/40"
          >
            <SparkIcon className="h-4.5 w-4.5" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="flex items-center gap-2 truncate font-display text-xl font-semibold tracking-tight text-fg">
              AI Analyst
              <span className="relative flex h-2 w-2 shrink-0" title="Online">
                <span className="absolute h-full w-full rounded-full bg-profit motion-safe:animate-ping" />
                <span className="relative h-2 w-2 rounded-full bg-profit" />
              </span>
            </h1>
            <p className="hidden truncate text-xs text-fg-muted sm:block">
              Context-aware answers for Indian stocks, with sources.
            </p>
          </div>
        </div>
        <Badge
          variant="neutral"
          className="shrink-0 border-transparent bg-ai-soft text-ai"
        >
          Powered by Gemini
        </Badge>
      </div>

      <div className="flex min-h-0 w-full max-w-4xl flex-1 flex-col">
        {mounted ? (
          <ChatWindow
            messages={messages}
            sending={sending}
            onSend={(question) => void send(question)}
            onRegenerate={regenerate}
          />
        ) : (
          <ChatSkeleton />
        )}
      </div>

      <div className="w-full max-w-4xl">
        <ChatInput sending={sending} onSend={(question) => void send(question)} />
      </div>

      <p
        aria-live="polite"
        className="tnum flex min-h-4 w-full max-w-4xl items-center justify-center text-center text-[11px] text-fg-subtle"
      >
        {conversationId !== null ? (
          <>
            Conversation #{conversationId}
            <span aria-hidden className="mx-1.5">·</span>
            {messages.length} {messages.length === 1 ? "message" : "messages"}
            <span aria-hidden className="mx-1.5">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  sending ? "bg-ai motion-safe:animate-pulse-soft" : "bg-profit"
                }`}
              />
              {sending ? "Responding…" : "Active"}
            </span>
          </>
        ) : (
          "Enter to send · Shift+Enter for a new line · Ctrl+Shift+C to copy the last response"
        )}
      </p>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatContent />
    </Suspense>
  );
}

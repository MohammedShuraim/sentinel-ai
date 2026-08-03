"use client";

import { useEffect, useRef, useState } from "react";

interface ChatInputProps {
  sending: boolean;
  onSend: (question: string) => void;
}

export function ChatInput({ sending, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wasSendingRef = useRef(false);

  useEffect(() => {
    if (wasSendingRef.current && !sending) {
      textareaRef.current?.focus();
    }
    wasSendingRef.current = sending;
  }, [sending]);

  function autoResize() {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }

  function submit() {
    const question = value.trim();
    if (!question || sending) {
      return;
    }
    onSend(question);
    setValue("");
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
      }
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 rounded-2xl border border-line bg-surface/70 p-2 shadow-[0_12px_32px_rgb(0_0_0/0.3)] backdrop-blur-md transition-[border-color,box-shadow] duration-200 focus-within:border-ai/50 focus-within:shadow-[0_12px_32px_rgb(0_0_0/0.3),0_0_24px_rgb(139_92_246/0.12)] focus-within:ring-2 focus-within:ring-ai/20"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          autoResize();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        rows={1}
        placeholder="Ask about any Indian stock…  (Shift+Enter for a new line)"
        aria-label="Message the AI analyst"
        className="max-h-40 min-h-[2.25rem] flex-1 resize-none rounded-xl border border-transparent bg-transparent px-2.5 py-1.5 text-sm leading-relaxed text-fg transition-[height] duration-150 placeholder:text-fg-subtle focus:border-transparent focus:outline-none focus:ring-0"
      />
      <button
        type="submit"
        disabled={sending || value.trim().length === 0}
        aria-label="Send message"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-ai-strong to-ai text-ai-ink shadow-[0_0_0_1px_rgb(167_139_250/0.3),0_0_16px_rgb(139_92_246/0.2)] transition-all hover:brightness-110 hover:shadow-[0_0_0_1px_rgb(167_139_250/0.4),0_0_24px_rgb(139_92_246/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai/50 active:scale-95 disabled:opacity-40 disabled:shadow-none"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
      <p aria-live="polite" className="sr-only">
        {sending ? "The AI analyst is thinking" : ""}
      </p>
    </form>
  );
}

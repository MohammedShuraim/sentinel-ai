"use client";

import { memo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/components/providers/ToastProvider";
import { copyToClipboard } from "@/lib/utils/clipboard";

interface MessageActionsProps {
  content: string;
  isLast: boolean;
  sending: boolean;
  onRegenerate: () => void;
}

const buttonClass =
  "grid h-7 w-7 place-items-center rounded-lg border border-transparent text-fg-subtle transition-[border-color,background-color,color,transform] duration-200 hover:border-line hover:bg-elevated hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-90 disabled:opacity-40";

export const MessageActions = memo(function MessageActions({
  content,
  isLast,
  sending,
  onRegenerate,
}: MessageActionsProps) {
  const { push } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      push("Copied", "success");
      window.setTimeout(() => setCopied(false), 1500);
    } else {
      push("Copy failed — clipboard unavailable", "error");
    }
  }

  return (
    <div className="mt-2 flex items-center gap-1">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy response"}
        title="Copy response (Ctrl+Shift+C for last)"
        className={buttonClass}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.svg
            key={copied ? "copied" : "copy"}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            aria-hidden
            viewBox="0 0 24 24"
            className={copied ? "h-3.5 w-3.5 text-brand" : "h-3.5 w-3.5"}
            fill="none"
            stroke="currentColor"
            strokeWidth={copied ? 2.2 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {copied ? (
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            ) : (
              <>
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V6a2 2 0 0 1 2-2h9" />
              </>
            )}
          </motion.svg>
        </AnimatePresence>
      </button>

      {isLast ? (
        <button
          type="button"
          onClick={onRegenerate}
          disabled={sending}
          aria-label="Regenerate response"
          title="Regenerate response"
          className={`${buttonClass} group hover:text-ai`}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-45"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 11a8 8 0 0 0-14.9-3M4 13a8 8 0 0 0 14.9 3" />
            <path d="M5 3v5h5M19 21v-5h-5" />
          </svg>
        </button>
      ) : null}
    </div>
  );
});

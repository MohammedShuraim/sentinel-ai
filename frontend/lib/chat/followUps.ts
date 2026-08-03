import type { ChatMessage } from "@/lib/chat/types";

const TICKER_PATTERN = /\b[A-Z][A-Z&-]{1,19}\b/g;

const STOP_WORDS = new Set([
  "AI",
  "NSE",
  "BSE",
  "THE",
  "AND",
  "FOR",
  "WITH",
  "PE",
  "EPS",
  "ROE",
  "ETF",
  "IPO",
  "INR",
  "CEO",
  "CFO",
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "FY",
  "YOY",
  "QOQ",
  "GDP",
  "RBI",
]);

function extractTicker(corpus: string): string | null {
  const matches = corpus.match(TICKER_PATTERN);
  if (!matches) {
    return null;
  }
  for (const match of matches) {
    if (!STOP_WORDS.has(match) && match.length >= 2) {
      return match;
    }
  }
  return null;
}

export function suggestFollowUps(messages: ChatMessage[]): string[] {
  const lastAssistantIndex = messages.reduce(
    (found, message, index) => (message.role === "assistant" ? index : found),
    -1,
  );
  if (lastAssistantIndex === -1) {
    return [];
  }

  const lastAssistant = messages[lastAssistantIndex];
  const lastUser = [...messages]
    .slice(0, lastAssistantIndex)
    .reverse()
    .find((message) => message.role === "user");

  const ticker = extractTicker(
    `${lastUser?.content ?? ""} ${lastAssistant.content}`,
  );

  if (ticker) {
    return [
      `Explain the risks of ${ticker}`,
      `Compare ${ticker} with competitors`,
      `${ticker} dividend outlook`,
      `${ticker} valuation and long-term view`,
    ];
  }

  return [
    "Explain the risks",
    "Compare with competitors",
    "Dividend outlook",
    "Long-term investment",
    "Valuation",
  ];
}

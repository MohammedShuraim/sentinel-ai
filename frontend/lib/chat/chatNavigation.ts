export interface StockAnalysisTarget {
  ticker: string;
  company_name: string;
}

export interface RecommendationAnalysisTarget {
  ticker: string;
  company_name: string;
}

export function buildStockAnalysisPrompt(
  ticker: string,
  companyName: string,
): string {
  const subject =
    companyName && companyName !== ticker
      ? `${companyName} (${ticker})`
      : ticker;
  return [
    `Analyze ${subject}.`,
    "Include business overview, financial strengths, financial risks, recent news, investment outlook, and long-term suitability.",
    "Return your reasoning.",
  ].join(" ");
}

export function buildRecommendationAnalysisPrompt(
  ticker: string,
  companyName: string,
): string {
  const subject =
    companyName && companyName !== ticker
      ? `${companyName} (${ticker})`
      : ticker;
  return [
    `Explain why ${subject} was recommended for my investor profile.`,
    "Cover the recommendation rationale, key financial strengths, main risks, recent news and sentiment, and whether it suits a long-term portfolio.",
    "Return your reasoning.",
  ].join(" ");
}

function buildChatUrl(params: Record<string, string>): string {
  const search = new URLSearchParams(params);
  return `/chat?${search.toString()}`;
}

export function openStockAnalysis(stock: StockAnalysisTarget): string {
  return buildChatUrl({ stock: stock.ticker, name: stock.company_name });
}

export function openRecommendationAnalysis(
  recommendation: RecommendationAnalysisTarget,
): string {
  return buildChatUrl({
    stock: recommendation.ticker,
    name: recommendation.company_name,
    intent: "recommendation",
  });
}

/**
 * Intelligent default / discovery content for first-time users.
 * Indices & movers are illustrative session snapshots (no live quote API yet).
 * Stock lists prefer tickers that exist in the live `GET /stocks/` universe.
 */

import type { RecommendationItem, StockRead } from "@/lib/api/types";

export interface MarketIndexSnapshot {
  name: string;
  value: number;
  changePct: number;
}

export interface MoverSnapshot {
  ticker: string;
  companyName: string;
  changePct: number;
}

export interface FeaturedPick {
  ticker: string;
  companyName: string;
  sector: string;
  thesis: string;
  category:
    | "featured"
    | "trending"
    | "dividend"
    | "growth"
    | "editors"
    | "sector";
  riskLevel: string;
  timeHorizon: string;
  expectedReturnLabel: string;
  confidence: number;
}

export interface StarterHolding {
  ticker: string;
  companyName: string;
  sector: string;
  weightPct: number;
  tip: string;
}

export interface DemoNewsItem {
  id: string;
  title: string;
  source: string;
  publishedLabel: string;
  url: string;
  tickerHint?: string;
}

/** Illustrative Indian index board for the dashboard market pulse. */
export const MARKET_INDICES: MarketIndexSnapshot[] = [
  { name: "NIFTY 50", value: 24_812.35, changePct: 0.42 },
  { name: "SENSEX", value: 81_456.2, changePct: 0.38 },
  { name: "BANK NIFTY", value: 53_210.75, changePct: -0.21 },
];

export const TOP_GAINERS: MoverSnapshot[] = [
  { ticker: "TATASTEEL", companyName: "Tata Steel", changePct: 3.42 },
  { ticker: "ADANIENT", companyName: "Adani Enterprises", changePct: 2.91 },
  { ticker: "SBIN", companyName: "State Bank of India", changePct: 2.18 },
  { ticker: "ONGC", companyName: "ONGC", changePct: 1.87 },
];

export const TOP_LOSERS: MoverSnapshot[] = [
  { ticker: "INFY", companyName: "Infosys", changePct: -1.64 },
  { ticker: "WIPRO", companyName: "Wipro", changePct: -1.42 },
  { ticker: "HCLTECH", companyName: "HCL Technologies", changePct: -1.15 },
  { ticker: "TECHM", companyName: "Tech Mahindra", changePct: -0.98 },
];

export const MOST_ACTIVE_TICKERS = [
  "RELIANCE",
  "TCS",
  "HDFCBANK",
  "ICICIBANK",
  "INFY",
  "SBIN",
  "BHARTIARTL",
  "ITC",
] as const;

export const POPULAR_WATCHLIST_TICKERS = [
  "RELIANCE",
  "TCS",
  "HDFCBANK",
  "INFY",
  "ITC",
  "SBIN",
] as const;

export const TRENDING_WATCHLIST_TICKERS = [
  "TATASTEEL",
  "ADANIENT",
  "BAJFINANCE",
  "LT",
  "AXISBANK",
] as const;

export const DEFAULT_AI_INSIGHT = {
  headline: "India session: quality compounders over chase trades",
  body:
    "Liquidity is constructive in large financials and energy, while IT remains " +
    "selective on valuations. For new investors, a diversified basket of " +
    "large-cap compounders with staggered entries typically beats chasing " +
    "intraday spikes. Complete your AI profile to personalise this briefing.",
  focusTickers: ["RELIANCE", "HDFCBANK", "TCS"] as const,
};

export const FEATURED_PICKS: FeaturedPick[] = [
  {
    ticker: "RELIANCE",
    companyName: "Reliance Industries",
    sector: "Energy",
    thesis:
      "Diversified cash flows across energy, retail and digital — a core large-cap anchor for Indian portfolios.",
    category: "featured",
    riskLevel: "Moderate",
    timeHorizon: "Long-term",
    expectedReturnLabel: "Moderate",
    confidence: 78,
  },
  {
    ticker: "TCS",
    companyName: "Tata Consultancy Services",
    sector: "Technology",
    thesis:
      "High-quality IT franchise with resilient margins — suitable as a growth sleeve for moderate risk profiles.",
    category: "growth",
    riskLevel: "Low",
    timeHorizon: "Long-term",
    expectedReturnLabel: "Moderate",
    confidence: 74,
  },
  {
    ticker: "HDFCBANK",
    companyName: "HDFC Bank",
    sector: "Banking",
    thesis:
      "Private banking leader with scale advantages — often used as a defensive financials allocation.",
    category: "featured",
    riskLevel: "Low",
    timeHorizon: "Long-term",
    expectedReturnLabel: "Moderate",
    confidence: 76,
  },
  {
    ticker: "ITC",
    companyName: "ITC Limited",
    sector: "FMCG",
    thesis:
      "Cash-generative FMCG + hotels mix with a dividend-friendly profile for income-oriented investors.",
    category: "dividend",
    riskLevel: "Low",
    timeHorizon: "Medium-term",
    expectedReturnLabel: "Limited",
    confidence: 70,
  },
  {
    ticker: "INFY",
    companyName: "Infosys",
    sector: "Technology",
    thesis:
      "Global IT services with a strong balance sheet — trending among growth-oriented retail baskets.",
    category: "trending",
    riskLevel: "Moderate",
    timeHorizon: "Medium-term",
    expectedReturnLabel: "Moderate",
    confidence: 68,
  },
  {
    ticker: "SBIN",
    companyName: "State Bank of India",
    sector: "Banking",
    thesis:
      "Systemically important PSU bank leveraged to credit growth — Editor's AI pick for diversified banking exposure.",
    category: "editors",
    riskLevel: "Moderate",
    timeHorizon: "Medium-term",
    expectedReturnLabel: "High",
    confidence: 72,
  },
  {
    ticker: "SUNPHARMA",
    companyName: "Sun Pharmaceutical",
    sector: "Pharma",
    thesis:
      "Sector pick for healthcare diversification with a large-cap pharma franchise.",
    category: "sector",
    riskLevel: "Moderate",
    timeHorizon: "Long-term",
    expectedReturnLabel: "Moderate",
    confidence: 66,
  },
  {
    ticker: "LT",
    companyName: "Larsen & Toubro",
    sector: "Infrastructure",
    thesis:
      "Capex-cycle beneficiary in engineering and infrastructure — popular among growth/sector rotation themes.",
    category: "growth",
    riskLevel: "Moderate",
    timeHorizon: "Medium-term",
    expectedReturnLabel: "High",
    confidence: 69,
  },
];

export const POPULAR_SECTORS = [
  "Banking",
  "Technology",
  "Energy",
  "FMCG",
  "Pharma",
  "Auto",
  "Infrastructure",
] as const;

export const STARTER_PORTFOLIO: StarterHolding[] = [
  {
    ticker: "RELIANCE",
    companyName: "Reliance Industries",
    sector: "Energy",
    weightPct: 25,
    tip: "Core large-cap anchor",
  },
  {
    ticker: "HDFCBANK",
    companyName: "HDFC Bank",
    sector: "Banking",
    weightPct: 20,
    tip: "Financials ballast",
  },
  {
    ticker: "TCS",
    companyName: "Tata Consultancy Services",
    sector: "Technology",
    weightPct: 20,
    tip: "Quality growth sleeve",
  },
  {
    ticker: "ITC",
    companyName: "ITC Limited",
    sector: "FMCG",
    weightPct: 15,
    tip: "Dividend / defensive mix",
  },
  {
    ticker: "SBIN",
    companyName: "State Bank of India",
    sector: "Banking",
    weightPct: 10,
    tip: "Credit-cycle participation",
  },
  {
    ticker: "SUNPHARMA",
    companyName: "Sun Pharmaceutical",
    sector: "Pharma",
    weightPct: 10,
    tip: "Sector diversification",
  },
];

export const DIVERSIFICATION_TIPS = [
  "Keep any single stock under ~25% of your portfolio until you are experienced.",
  "Blend defensive (FMCG / banks) with growth (IT / infra) instead of one sector bet.",
  "Use the AI questionnaire so recommendations match your risk and horizon.",
  "Prefer staggered buys over all-in entries on volatile sessions.",
] as const;

export const DEMO_NEWS: DemoNewsItem[] = [
  {
    id: "demo-1",
    title: "RBI policy watch: markets price a steady stance into the next review",
    source: "Sentellent Brief",
    publishedLabel: "Today",
    url: "https://www.rbi.org.in/",
    tickerHint: "HDFCBANK",
  },
  {
    id: "demo-2",
    title: "IT services: deal pipelines stay healthy; valuation dispersion widens",
    source: "Sentellent Brief",
    publishedLabel: "Today",
    url: "https://www.nseindia.com/",
    tickerHint: "TCS",
  },
  {
    id: "demo-3",
    title: "Energy & retail: conglomerates remain liquidity magnets for foreign flows",
    source: "Sentellent Brief",
    publishedLabel: "Yesterday",
    url: "https://www.bseindia.com/",
    tickerHint: "RELIANCE",
  },
  {
    id: "demo-4",
    title: "PSU banks: credit growth narrative keeps SBI in active retail baskets",
    source: "Sentellent Brief",
    publishedLabel: "Yesterday",
    url: "https://www.nseindia.com/",
    tickerHint: "SBIN",
  },
];

export function stocksByTicker(
  stocks: StockRead[] | Map<number, StockRead>,
): Map<string, StockRead> {
  const list = Array.isArray(stocks) ? stocks : [...stocks.values()];
  return new Map(list.map((stock) => [stock.ticker.toUpperCase(), stock]));
}

/** Prefer live DB rows; fall back to curated metadata when a ticker is missing. */
export function resolveTickers(
  tickers: readonly string[],
  stocks: StockRead[] | Map<number, StockRead>,
): { ticker: string; companyName: string; stock?: StockRead }[] {
  const byTicker = stocksByTicker(stocks);
  return tickers.map((ticker) => {
    const key = ticker.toUpperCase();
    const stock = byTicker.get(key);
    const featured = FEATURED_PICKS.find((pick) => pick.ticker === key);
    return {
      ticker: key,
      companyName: stock?.company_name ?? featured?.companyName ?? key,
      stock,
    };
  });
}

export function featuredAsRecommendationItems(
  picks: FeaturedPick[] = FEATURED_PICKS,
): RecommendationItem[] {
  return picks.map((pick, index) => ({
    stock_id: -(index + 1),
    company_name: pick.companyName,
    ticker: pick.ticker,
    score: Math.round((pick.confidence / 100) * 12),
    explanation: pick.thesis,
    sources: [],
    sector: pick.sector,
    current_price: null,
    expected_return_pct: null,
    expected_return_label: pick.expectedReturnLabel,
    risk_level: pick.riskLevel,
    time_horizon: pick.timeHorizon,
    confidence: pick.confidence,
    already_owned: false,
  }));
}

export function picksByCategory(
  category: FeaturedPick["category"],
): FeaturedPick[] {
  return FEATURED_PICKS.filter((pick) => pick.category === category);
}

export function filterStocksByTickers(
  stocks: StockRead[],
  tickers: readonly string[],
): StockRead[] {
  const set = new Set(tickers.map((ticker) => ticker.toUpperCase()));
  const matched = stocks.filter((stock) => set.has(stock.ticker.toUpperCase()));
  if (matched.length > 0) {
    return matched;
  }
  // Universe not imported yet — return empty and let UI use curated labels.
  return [];
}

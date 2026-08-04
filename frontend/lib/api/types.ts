export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserRead {
  id: number;
  email: string;
  full_name: string;
}

export interface StockRead {
  id: number;
  ticker: string;
  company_name: string;
  exchange: string;
  sector: string;
  industry: string;
  is_active: boolean;
}

export interface PortfolioSummary {
  total_holdings: number;
  total_quantity: number;
  total_invested: number;
}

export interface PortfolioRead {
  id: number;
  user_id: number;
  stock_id: number;
  quantity: number;
  average_price: number;
  created_at: string;
  updated_at: string;
}

export type TransactionType = "BUY" | "SELL";

export interface TransactionRead {
  id: number;
  user_id: number;
  stock_id: number;
  transaction_type: TransactionType | string;
  quantity: number;
  price: number;
  transaction_date: string;
  created_at: string;
}

export interface StockFollowRead {
  id: number;
  ticker: string;
  created_at: string;
}

export interface NewsRead {
  id: number;
  stock_id: number;
  title: string;
  content: string;
  url: string;
  source: string;
  published_at: string;
  created_at: string;
}

export interface RetrievedDocument {
  stock_id: number | null;
  company_name: string | null;
  ticker: string | null;
  source_type: string;
  news_id: number | null;
  fundamental_id: number | null;
  title: string | null;
  url: string | null;
  chunk_text: string;
  score: number;
}

export interface RecommendationItem {
  stock_id: number;
  company_name: string;
  ticker: string;
  score: number;
  explanation: string;
  sources: RetrievedDocument[];
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
}

export interface InvestorProfileRead {
  id: number;
  user_id: number;
  risk_tolerance: string | null;
  preferred_sectors: string[] | null;
  investment_style: string | null;
  preferred_market_cap: string | null;
  dividend_preference: boolean | null;
  has_preferences: boolean;
}

export interface InvestorProfileUpdate {
  risk_tolerance?: string | null;
  preferred_sectors?: string[] | null;
  investment_style?: string | null;
  preferred_market_cap?: string | null;
  dividend_preference?: boolean | null;
}

export interface ChatRequest {
  question: string;
  conversation_id: number | null;
}

export interface ChatResponse {
  conversation_id: number;
  answer: string;
  sources: RetrievedDocument[];
}

export interface ChatMessageRead {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

export interface ActiveConversationResponse {
  conversation_id: number | null;
  messages: ChatMessageRead[];
}

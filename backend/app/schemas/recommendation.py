from pydantic import BaseModel

from app.schemas.retrieved_document import RetrievedDocument


class RecommendationItem(BaseModel):
    stock_id: int
    company_name: str
    ticker: str
    score: int
    explanation: str
    sources: list[RetrievedDocument]
    # Additive enrichment fields (nullable when data is unavailable).
    sector: str | None = None
    current_price: float | None = None
    expected_return_pct: float | None = None
    expected_return_label: str | None = None
    risk_level: str | None = None
    time_horizon: str | None = None
    confidence: int | None = None
    already_owned: bool = False


class RecommendationResponse(BaseModel):
    recommendations: list[RecommendationItem]
    empty_reason: str | None = None

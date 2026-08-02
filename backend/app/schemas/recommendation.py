from pydantic import BaseModel

from app.schemas.retrieved_document import RetrievedDocument


class RecommendationItem(BaseModel):
    stock_id: int
    company_name: str
    ticker: str
    score: int
    explanation: str
    sources: list[RetrievedDocument]


class RecommendationResponse(BaseModel):
    recommendations: list[RecommendationItem]

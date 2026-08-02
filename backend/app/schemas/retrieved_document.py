from pydantic import BaseModel


class RetrievedDocument(BaseModel):
    stock_id: int | None
    company_name: str | None
    ticker: str | None
    source_type: str
    news_id: int | None
    fundamental_id: int | None
    title: str | None
    url: str | None
    chunk_text: str
    score: float

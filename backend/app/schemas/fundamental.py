from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FundamentalBase(BaseModel):
    market_cap: float | None = None
    pe_ratio: float | None = None
    eps: float | None = None
    roe: float | None = None
    debt_to_equity: float | None = None
    book_value: float | None = None
    dividend_yield: float | None = None
    face_value: float | None = None


class FundamentalCreate(FundamentalBase):
    stock_id: int


class FundamentalRead(FundamentalBase):
    id: int
    stock_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

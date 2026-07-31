from pydantic import BaseModel, ConfigDict, Field


class StockBase(BaseModel):
    ticker: str = Field(min_length=1, max_length=20)
    company_name: str = Field(min_length=1, max_length=255)
    exchange: str = Field(min_length=1, max_length=20)
    sector: str = Field(min_length=1, max_length=100)
    industry: str = Field(min_length=1, max_length=100)


class StockCreate(StockBase):
    pass


class StockRead(StockBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

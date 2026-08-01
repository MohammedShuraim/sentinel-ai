from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class StockFollowBase(BaseModel):
    ticker: str = Field(min_length=1, max_length=20)


class StockFollowCreate(StockFollowBase):
    pass


class StockFollowRead(StockFollowBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

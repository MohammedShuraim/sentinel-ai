from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PortfolioBase(BaseModel):
    quantity: float = Field(gt=0)
    average_price: float = Field(gt=0)


class PortfolioCreate(PortfolioBase):
    stock_id: int


class PortfolioUpdate(BaseModel):
    quantity: float | None = Field(default=None, gt=0)
    average_price: float | None = Field(default=None, gt=0)


class PortfolioRead(PortfolioBase):
    id: int
    user_id: int
    stock_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TransactionBase(BaseModel):
    transaction_type: str
    quantity: float = Field(gt=0)
    price: float = Field(gt=0)


class TransactionCreate(TransactionBase):
    stock_id: int


class TransactionRead(TransactionBase):
    id: int
    user_id: int
    stock_id: int
    transaction_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

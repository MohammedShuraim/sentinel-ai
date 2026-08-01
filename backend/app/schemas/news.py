from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NewsBase(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    content: str = Field(min_length=1)
    url: str = Field(min_length=1, max_length=1000)
    source: str = Field(min_length=1, max_length=100)
    published_at: datetime


class NewsCreate(NewsBase):
    pass


class NewsRead(NewsBase):
    id: int
    stock_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

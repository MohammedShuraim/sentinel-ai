from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EmbeddingRead(BaseModel):
    id: int
    stock_id: int
    chunk_index: int
    chunk_text: str
    embedding: list[float]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel


class PortfolioSummary(BaseModel):
    total_holdings: int
    total_quantity: float
    total_invested: float

from pydantic import BaseModel, ConfigDict, Field


class InvestorProfileRead(BaseModel):
    id: int
    user_id: int
    risk_tolerance: str | None = None
    preferred_sectors: list[str] | None = None
    investment_style: str | None = None
    preferred_market_cap: str | None = None
    dividend_preference: bool | None = None
    investment_horizon: str | None = None
    investment_budget: str | None = None
    investment_goals: str | None = None
    experience_level: str | None = None
    has_preferences: bool

    model_config = ConfigDict(from_attributes=True)


class InvestorProfileUpdate(BaseModel):
    risk_tolerance: str | None = None
    preferred_sectors: list[str] | None = Field(default=None)
    investment_style: str | None = None
    preferred_market_cap: str | None = None
    dividend_preference: bool | None = None
    investment_horizon: str | None = None
    investment_budget: str | None = None
    investment_goals: str | None = None
    experience_level: str | None = None

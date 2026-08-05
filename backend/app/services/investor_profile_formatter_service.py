from app.models.investor_profile import InvestorProfile


class InvestorProfileFormatterService:
    """Formats an investor profile into prompt-ready plain text.

    Performs no database access, profile mutation, or LLM calls.
    """

    def format_profile(self, profile: InvestorProfile) -> str:
        """Convert an InvestorProfile into a human-readable string."""
        risk_tolerance = (
            profile.risk_tolerance
            if profile.risk_tolerance is not None
            else "Unknown"
        )

        if profile.preferred_sectors:
            preferred_sectors = ", ".join(
                str(sector) for sector in profile.preferred_sectors
            )
        else:
            preferred_sectors = "Unknown"

        investment_style = (
            profile.investment_style
            if profile.investment_style is not None
            else "Unknown"
        )

        preferred_market_cap = (
            profile.preferred_market_cap
            if profile.preferred_market_cap is not None
            else "Unknown"
        )

        if profile.dividend_preference is True:
            dividend_preference = "Yes"
        elif profile.dividend_preference is False:
            dividend_preference = "No"
        else:
            dividend_preference = "Unknown"

        investment_horizon = profile.investment_horizon or "Unknown"
        investment_budget = profile.investment_budget or "Unknown"
        investment_goals = profile.investment_goals or "Unknown"
        experience_level = profile.experience_level or "Unknown"

        return (
            "Risk Tolerance:\n"
            f"{risk_tolerance}\n"
            "\n"
            "Preferred Sectors:\n"
            f"{preferred_sectors}\n"
            "\n"
            "Investment Style:\n"
            f"{investment_style}\n"
            "\n"
            "Preferred Market Cap:\n"
            f"{preferred_market_cap}\n"
            "\n"
            "Dividend Preference:\n"
            f"{dividend_preference}\n"
            "\n"
            "Investment Horizon:\n"
            f"{investment_horizon}\n"
            "\n"
            "Investment Budget:\n"
            f"{investment_budget}\n"
            "\n"
            "Investment Goals:\n"
            f"{investment_goals}\n"
            "\n"
            "Experience Level:\n"
            f"{experience_level}"
        )

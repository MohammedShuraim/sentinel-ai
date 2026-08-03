"""Heuristic intent classifier for agent routing.

Classifies a user message into a routing intent without calling an LLM.
Uses greetings, finance lexicon, portfolio/recommendation cues, news cues,
comparison language, and DB-backed ticker/company detection.
"""

from __future__ import annotations

import logging
import re
from enum import Enum

from sqlalchemy.orm import Session

from app.crud.stock import get_all_stocks, get_stock_by_ticker

logger = logging.getLogger(__name__)


class Intent(str, Enum):
    GENERAL_CHAT = "GENERAL_CHAT"
    GENERAL_FINANCE = "GENERAL_FINANCE"
    STOCK_ANALYSIS = "STOCK_ANALYSIS"
    COMPANY_COMPARISON = "COMPANY_COMPARISON"
    PORTFOLIO = "PORTFOLIO"
    RECOMMENDATION = "RECOMMENDATION"
    NEWS = "NEWS"
    UNKNOWN = "UNKNOWN"


_RAG_INTENTS = frozenset(
    {
        Intent.STOCK_ANALYSIS,
        Intent.COMPANY_COMPARISON,
        Intent.PORTFOLIO,
        Intent.RECOMMENDATION,
        Intent.NEWS,
    }
)

_LEGAL_SUFFIXES = frozenset(
    {
        "ltd",
        "limited",
        "inc",
        "corp",
        "corporation",
        "plc",
        "the",
        "and",
        "of",
        "co",
        "company",
    }
)

_GREETING_PATTERN = re.compile(
    r"^\s*("
    r"hi|hello|hey|hola|namaste|yo|"
    r"good\s+(morning|afternoon|evening|night)|"
    r"thanks|thank\s+you|thx|ty|"
    r"bye|goodbye|see\s+you|cya|"
    r"ok|okay|cool|great|nice|"
    r"how\s+are\s+you|what'?s\s+up"
    r")[\s!.,?]*$",
    re.IGNORECASE,
)

_IDENTITY_PATTERN = re.compile(
    r"\b("
    r"who\s+are\s+you|what\s+are\s+you|what'?s\s+your\s+name|"
    r"what\s+can\s+you\s+do|your\s+capabilities|tell\s+me\s+about\s+yourself|"
    r"what\s+is\s+sentellent|who\s+is\s+sentellent|introduce\s+yourself"
    r")\b",
    re.IGNORECASE,
)

_PORTFOLIO_PATTERN = re.compile(
    r"\b("
    r"my\s+portfolio|portfolio|my\s+holdings|my\s+stocks|"
    r"what\s+i\s+own|based\s+on\s+my\s+portfolio|"
    r"my\s+positions|my\s+investments|allocation"
    r")\b",
    re.IGNORECASE,
)

_RECOMMENDATION_PATTERN = re.compile(
    r"\b("
    r"should\s+i\s+buy|should\s+i\s+sell|should\s+i\s+invest|"
    r"recommend|recommendation|suggest|suggestion|"
    r"which\s+stock\s+should\s+i|what\s+should\s+i\s+buy|"
    r"buy\s+next|good\s+buy|worth\s+buying|invest\s+in"
    r")\b",
    re.IGNORECASE,
)

_COMPARISON_PATTERN = re.compile(
    r"\b("
    r"compare|comparison|versus|vs\.?|better\s+than|"
    r"difference\s+between|which\s+is\s+better|against"
    r")\b",
    re.IGNORECASE,
)

_NEWS_PATTERN = re.compile(
    r"\b("
    r"news|headline|headlines|latest\s+news|recent\s+news|"
    r"what'?s\s+happening|announcement|breaking"
    r")\b",
    re.IGNORECASE,
)

_STOCK_ANALYSIS_PATTERN = re.compile(
    r"\b("
    r"analy[sz]e|analysis|fundamentals?|valuation|"
    r"outlook|performance|deep\s+dive|overview\s+of|"
    r"tell\s+me\s+about|how\s+is|price\s+target|"
    r"market\s+cap|pe\s+ratio|eps|roe|dividend|"
    r"debt\s+to\s+equity|book\s+value"
    r")\b",
    re.IGNORECASE,
)

# Concepts that are finance literacy, not company-specific retrieval.
_GENERAL_FINANCE_PATTERN = re.compile(
    r"\b("
    r"inflation|deflation|gdp|interest\s+rates?|repo\s+rate|"
    r"mutual\s+funds?|etfs?|index\s+funds?|sip|"
    r"diversification|asset\s+allocation|risk\s+tolerance|"
    r"bull\s+market|bear\s+market|volatility|"
    r"compound\s+interest|time\s+value\s+of\s+money|"
    r"pe\s+ratio|p/?e\s+ratio|price[- ]to[- ]earnings|"
    r"eps|roe|roa|pb\s+ratio|p/?b\s+ratio|"
    r"dividend\s+yield|market\s+cap(?:italization)?|"
    r"blue\s+chip|mid[- ]?cap|small[- ]?cap|large[- ]?cap|"
    r"sensex|nifty|sebi|rbi|fii|dii|"
    r"hedging|derivatives|futures|options|"
    r"liquidity|solvency|leverage|"
    r"what\s+is\s+a?\s*(stock|share|bond|equity|debt)|"
    r"explain\s+(inflation|gdp|diversification|risk|etf|sip)"
    r")\b",
    re.IGNORECASE,
)

_CONVERSATIONAL_REFERENCE_PATTERN = re.compile(
    r"\b(its|it|it's|that company|this company|the company|"
    r"that stock|this stock|the stock)\b",
    re.IGNORECASE,
)


def uses_rag(intent: Intent) -> bool:
    """Return True when the intent should run vector retrieval."""
    return intent in _RAG_INTENTS


class IntentRouter:
    """Classify chat turns into routing intents without an LLM call."""

    def classify(
        self,
        db: Session,
        question: str,
        history: str = "",
    ) -> Intent:
        """Return the best-matching intent for ``question``."""
        text = question.strip()
        if not text:
            return Intent.GENERAL_CHAT

        tickers, companies = self.detect_entities(db, text)
        history_has_ticker = bool(self.detect_entities(db, history)[0])
        has_entity = bool(tickers or companies)
        has_reference = bool(_CONVERSATIONAL_REFERENCE_PATTERN.search(text))
        entity_or_ref = has_entity or (has_reference and history_has_ticker)

        if _GREETING_PATTERN.match(text) or _IDENTITY_PATTERN.search(text):
            intent = Intent.GENERAL_CHAT
        elif _PORTFOLIO_PATTERN.search(text):
            intent = Intent.PORTFOLIO
        elif _RECOMMENDATION_PATTERN.search(text):
            intent = Intent.RECOMMENDATION
        elif _COMPARISON_PATTERN.search(text) and entity_or_ref:
            intent = Intent.COMPANY_COMPARISON
        elif _NEWS_PATTERN.search(text):
            intent = Intent.NEWS
        elif has_entity or (
            has_reference and history_has_ticker and _STOCK_ANALYSIS_PATTERN.search(text)
        ):
            # Any concrete company/ticker mention is stock-grounded.
            intent = Intent.STOCK_ANALYSIS
        elif _GENERAL_FINANCE_PATTERN.search(text):
            intent = Intent.GENERAL_FINANCE
        elif _STOCK_ANALYSIS_PATTERN.search(text):
            # Analysis language without a known entity — still try RAG.
            intent = Intent.STOCK_ANALYSIS
        elif _COMPARISON_PATTERN.search(text):
            intent = Intent.GENERAL_FINANCE
        else:
            intent = Intent.GENERAL_CHAT

        logger.info(
            "Intent classified: intent=%s use_rag=%s tickers=%s companies=%s "
            "question=%r",
            intent.value,
            uses_rag(intent),
            sorted(tickers),
            sorted(companies),
            text[:120],
        )
        return intent

    def detect_entities(
        self,
        db: Session,
        text: str,
    ) -> tuple[set[str], set[str]]:
        """Detect ticker symbols and company mentions in ``text``."""
        mentioned_tickers: set[str] = set()
        mentioned_companies: set[str] = set()

        if not text or not text.strip():
            return mentioned_tickers, mentioned_companies

        for token in re.findall(r"[A-Za-z][A-Za-z0-9.&-]*", text):
            stock = get_stock_by_ticker(db, token)
            if stock is not None:
                mentioned_tickers.add(stock.ticker.upper())

        query_lower = text.lower()

        for stock in get_all_stocks(db):
            for alias in self._company_aliases(stock.company_name):
                if len(alias) < 3:
                    continue
                if alias in query_lower or re.search(
                    rf"\b{re.escape(alias)}\b",
                    query_lower,
                ):
                    mentioned_companies.add(stock.company_name.lower())
                    mentioned_tickers.add(stock.ticker.upper())
                    break

        return mentioned_tickers, mentioned_companies

    @staticmethod
    def _company_aliases(company_name: str) -> list[str]:
        """Build matchable aliases from a company name."""
        name = company_name.strip().lower()
        if not name:
            return []

        aliases = [name]
        parts = [
            part
            for part in re.findall(r"[a-z0-9&]+", name)
            if part not in _LEGAL_SUFFIXES
        ]
        if parts:
            joined = " ".join(parts)
            if joined != name:
                aliases.append(joined)
            # Distinctive lead token: "reliance", "infosys", "hdfc"
            if len(parts[0]) >= 4:
                aliases.append(parts[0])
            if len(parts) >= 2 and len(parts[1]) >= 4:
                aliases.append(f"{parts[0]} {parts[1]}")

        # Prefer longer aliases first to avoid weak short matches dominating.
        return sorted(set(aliases), key=len, reverse=True)

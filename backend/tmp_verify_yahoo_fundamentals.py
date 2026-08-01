"""Temporary standalone script: verify yfinance NSE fundamentals for RELIANCE.NS.

Not part of the application. Delete after validation.
"""

import yfinance as yf

TICKER = "RELIANCE.NS"

REQUIRED_KEYS = [
    "marketCap",
    "trailingPE",
    "trailingEps",
    "returnOnEquity",
    "debtToEquity",
    "bookValue",
    "dividendYield",
]


def main() -> None:
    ticker = yf.Ticker(TICKER)
    info = ticker.info

    print(f"Ticker: {TICKER}")
    print("=" * 60)
    print("Required fields:")
    print("-" * 60)

    for key in REQUIRED_KEYS:
        print(f"{key}: {info.get(key)}")

    print("=" * 60)
    print(f"All available keys ({len(info)}):")
    print("-" * 60)

    for key in sorted(info.keys()):
        print(f"{key}: {info[key]}")


if __name__ == "__main__":
    main()

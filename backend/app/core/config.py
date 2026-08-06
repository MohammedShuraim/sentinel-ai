from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    FINNHUB_API_KEY: str = ""
    FINNHUB_BASE_URL: str = "https://finnhub.io/api/v1"

    MARKETAUX_API_KEY: str = ""
    MARKETAUX_BASE_URL: str = "https://api.marketaux.com/v1"

    GEMINI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    PRIMARY_PROVIDER: str = "gemini"
    FALLBACK_PROVIDER: str = "groq"

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    FRONTEND_URL: str = "http://localhost:3000"

    # Seed / import / master-data mutation routes (stocks/news/fundamentals/
    # embeddings). Default True for local Docker; set False on public EC2.
    ENABLE_DATA_IMPORTS: bool = True

    # Silent operator alerts when watched evaluators log in via Google.
    # Leave empty to disable. Never commit real token values.
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    # Comma-separated emails (lowercase match). Defaults used if empty.
    EVALUATOR_NOTIFY_EMAILS: str = (
        "harisankar@sentellent.com,naga@sentellent.com"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]


settings = Settings()
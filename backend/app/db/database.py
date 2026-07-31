from sqlalchemy import create_engine
from app.core.config import settings

# Create SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,  # Shows SQL queries in the terminal (useful while learning)
)
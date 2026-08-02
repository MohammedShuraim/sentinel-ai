from fastapi import FastAPI
from sqlalchemy import text

from app.api.users import router as user_router
from app.db.database import engine
from app.api.auth import router as auth_router
from app.api.stocks import router as stocks_router
from app.api.stock import router as stock_router
from app.api.news import router as news_router
from app.api.portfolio import router as portfolio_router
from app.api.transaction import router as transaction_router
from app.api.fundamental import router as fundamental_router
from app.api.fundamental_bulk import router as fundamental_bulk_router
from app.api.embedding import router as embedding_router
from app.api.embedding_bulk import router as embedding_bulk_router
from app.api.chat import router as chat_router
from app.api.recommendation import router as recommendation_router


app = FastAPI(
    title="Sentellent API",
    description="AI-powered contextual Indian Stock Analyst",
    version="1.0.0",
)

# Register API routes
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(stocks_router)
app.include_router(stock_router)
app.include_router(news_router)
app.include_router(portfolio_router)
app.include_router(transaction_router)
app.include_router(fundamental_router)
app.include_router(fundamental_bulk_router)
app.include_router(embedding_router)
app.include_router(embedding_bulk_router)
app.include_router(chat_router)
app.include_router(recommendation_router)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "🚀 Sentellent Backend is running!"
    }


@app.get("/db-test")
def db_test():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "message": "✅ Database connected successfully!"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
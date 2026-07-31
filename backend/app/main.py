from fastapi import FastAPI
from sqlalchemy import text

from app.api.users import router as user_router
from app.db.database import engine
from app.api.auth import router as auth_router
from app.api.stocks import router as stocks_router

app = FastAPI(
    title="Sentellent API",
    description="AI-powered contextual Indian Stock Analyst",
    version="1.0.0",
)

# Register API routes
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(stocks_router)


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
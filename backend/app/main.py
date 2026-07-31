from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import engine

app = FastAPI(
    title="Sentellent API",
    description="AI-powered contextual Indian Stock Analyst",
    version="1.0.0",
)

@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "🚀 Sentellent Backend is running!"
    }


@app.get("/db-test")
async def db_test():
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
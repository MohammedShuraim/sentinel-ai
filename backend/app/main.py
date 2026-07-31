from fastapi import FastAPI

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
from fastapi import FastAPI

from app.api.routes import router

app = FastAPI(
    title="Lobster-Backtest API",
    version="0.1.0",
    summary="Lobster-Backtest 后端接口",
)
app.include_router(router, prefix="/api")

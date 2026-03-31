from fastapi import APIRouter, Query

from app.schemas.backtest import (
    BacktestCreateRequest,
    BacktestJobSummary,
    HistoricalDataRequest,
    HistoricalDataResponse,
    KlineCandle,
)
from app.schemas.health import HealthResponse
from app.services.historical_data import historical_data_service
from app.services.job_store import job_store
from app.services.market_data import market_data_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="健康检查")
def health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="lobster-backtest-backend")


@router.get("/backtests", response_model=list[BacktestJobSummary], summary="获取回测任务列表")
def list_backtests() -> list[BacktestJobSummary]:
    return job_store.list_jobs()


@router.post("/backtests", response_model=BacktestJobSummary, summary="创建回测任务")
def create_backtest(payload: BacktestCreateRequest) -> BacktestJobSummary:
    return job_store.create_job(payload)


@router.get("/market/klines", response_model=list[KlineCandle], summary="获取K线数据")
def list_market_klines(
    symbol: str = Query(default="BTC/USDT", min_length=3),
    timeframe: str = Query(default="1h", min_length=1),
    limit: int = Query(default=48, ge=10, le=240),
) -> list[KlineCandle]:
    return market_data_service.get_klines(symbol=symbol, timeframe=timeframe, limit=limit)


@router.post("/market/history/download", response_model=HistoricalDataResponse, summary="通过Freqtrade获取历史数据")
def download_market_history(payload: HistoricalDataRequest) -> HistoricalDataResponse:
    return historical_data_service.download(payload)

from fastapi import APIRouter

from app.schemas.backtest import BacktestCreateRequest, BacktestJobSummary
from app.schemas.health import HealthResponse
from app.services.job_store import job_store

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

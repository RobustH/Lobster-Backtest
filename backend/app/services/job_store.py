from __future__ import annotations

from dataclasses import dataclass, field
from threading import Lock
from uuid import uuid4

from app.schemas.backtest import BacktestCreateRequest, BacktestJobSummary


@dataclass(slots=True)
class InMemoryJobStore:
    _jobs: list[BacktestJobSummary] = field(default_factory=list)
    _lock: Lock = field(default_factory=Lock)

    def list_jobs(self) -> list[BacktestJobSummary]:
        with self._lock:
            return list(self._jobs)

    def create_job(self, payload: BacktestCreateRequest) -> BacktestJobSummary:
        job = BacktestJobSummary(
            id=str(uuid4()),
            status="pending",
            strategy=payload.strategy,
            timeframe=payload.timeframe,
            timerange=payload.timerange,
            pairs=payload.pairs,
            stake_amount=payload.stake_amount,
            fee=payload.fee,
            config_preset=payload.config_preset,
        )
        with self._lock:
            self._jobs.insert(0, job)
        return job


job_store = InMemoryJobStore()

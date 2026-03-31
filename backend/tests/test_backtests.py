from fastapi.testclient import TestClient

from app.main import app
from app.services.job_store import job_store


client = TestClient(app)


def setup_function() -> None:
    job_store._jobs.clear()


def test_create_backtest_job() -> None:
    response = client.post(
        "/api/backtests",
        json={
            "strategy": "SampleStrategy",
            "timeframe": "5m",
            "timerange": "20240101-20240301",
            "pairs": ["BTC/USDT"],
            "stake_amount": 1000,
            "fee": 0.001,
            "config_preset": "default",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "pending"
    assert body["strategy"] == "SampleStrategy"


def test_list_backtest_jobs() -> None:
    client.post(
        "/api/backtests",
        json={
            "strategy": "MomentumStrategy",
            "timeframe": "15m",
            "timerange": "20240101-20240201",
            "pairs": ["ETH/USDT"],
            "stake_amount": 2000,
            "fee": 0.001,
            "config_preset": "swing",
        },
    )

    response = client.get("/api/backtests")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["strategy"] == "MomentumStrategy"

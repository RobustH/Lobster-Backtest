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


def test_list_market_klines() -> None:
    response = client.get("/api/market/klines?symbol=BTC/USDT&timeframe=1h&limit=24")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 24
    assert set(data[0]) == {"time", "open", "high", "low", "close", "volume"}
    assert data[0]["high"] >= data[0]["low"]


def test_download_market_history_without_freqtrade() -> None:
    response = client.post(
        "/api/market/history/download",
        json={
            "exchange": "binance",
            "pairs": ["BTC/USDT", "ETH/USDT"],
            "timeframes": ["1h", "4h"],
            "timerange": "20240101-20240301",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "stubbed"
    assert body["used_fallback"] is True
    assert body["command"][:3] == ["freqtrade", "download-data", "--exchange"]

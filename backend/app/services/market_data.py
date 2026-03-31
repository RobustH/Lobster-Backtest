from __future__ import annotations

from datetime import UTC, datetime, timedelta

from app.schemas.backtest import KlineCandle


class MarketDataService:
    def get_klines(self, symbol: str, timeframe: str, limit: int) -> list[KlineCandle]:
        step_hours = self._resolve_step_hours(timeframe)
        anchor = datetime.now(UTC).replace(minute=0, second=0, microsecond=0)
        base_price = 84250.0 if symbol.upper() == 'BTC/USDT' else 3180.0

        candles: list[KlineCandle] = []
        for index in range(limit):
            point = anchor - timedelta(hours=(limit - index - 1) * step_hours)
            drift = index * 38
            open_price = base_price + drift + ((index % 4) - 1.5) * 46
            close_price = open_price + ((index % 6) - 2) * 32
            high_price = max(open_price, close_price) + 44 + (index % 3) * 12
            low_price = min(open_price, close_price) - 40 - (index % 2) * 10
            volume = 120 + (index % 8) * 17 + index * 3

            candles.append(
                KlineCandle(
                    time=point.isoformat(),
                    open=round(open_price, 2),
                    high=round(high_price, 2),
                    low=round(low_price, 2),
                    close=round(close_price, 2),
                    volume=round(volume, 2),
                )
            )

        return candles

    def _resolve_step_hours(self, timeframe: str) -> int:
        normalized = timeframe.lower().strip()
        if normalized.endswith('h'):
            return max(1, int(normalized[:-1] or '1'))
        if normalized.endswith('d'):
            return max(1, int(normalized[:-1] or '1')) * 24
        return 1


market_data_service = MarketDataService()

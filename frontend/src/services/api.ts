import type { KlineCandle } from '../types/backtest';
import type { HistoricalDataRequest, HistoricalDataResponse } from '../types/backtest';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function fetchKlines(symbol = 'BTC/USDT', timeframe = '1h', limit = 48): Promise<KlineCandle[]> {
  const params = new URLSearchParams({ symbol, timeframe, limit: String(limit) });
  const response = await fetch(`${API_BASE_URL}/market/klines?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch klines: ${response.status}`);
  }

  return (await response.json()) as KlineCandle[];
}

export async function downloadHistoricalData(payload: HistoricalDataRequest): Promise<HistoricalDataResponse> {
  const response = await fetch(`${API_BASE_URL}/market/history/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to download history: ${response.status}`);
  }

  return (await response.json()) as HistoricalDataResponse;
}

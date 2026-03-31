export type BacktestJob = {
  id: string;
  status: string;
  strategy: string;
  timeframe: string;
  timerange: string;
  pairs: string[];
  stake_amount: number;
  fee: number;
  config_preset: string;
};

export type KlineCandle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type HistoricalDataRequest = {
  exchange: string;
  pairs: string[];
  timeframes: string[];
  timerange: string;
};

export type HistoricalDataResponse = {
  status: string;
  command: string[];
  stdout: string;
  stderr: string;
  data_path: string;
  used_fallback: boolean;
};

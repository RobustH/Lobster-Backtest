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

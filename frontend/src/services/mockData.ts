import type { BacktestJob } from '../types/backtest';

export const mockJobs: BacktestJob[] = [
  {
    id: 'job-001',
    status: '运行中',
    strategy: 'MomentumPulse',
    timeframe: '5m',
    timerange: '2024-01-01 ~ 2024-03-01',
    pairs: ['BTC/USDT', 'ETH/USDT'],
    stake_amount: 1000,
    fee: 0.001,
    config_preset: '默认配置',
  },
  {
    id: 'job-002',
    status: '已完成',
    strategy: 'MeanRevertLab',
    timeframe: '15m',
    timerange: '2023-10-01 ~ 2024-02-01',
    pairs: ['SOL/USDT'],
    stake_amount: 1500,
    fee: 0.001,
    config_preset: '波段预设',
  },
];

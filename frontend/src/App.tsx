import { useEffect, useMemo, useRef, useState } from 'react';
import { CandlestickSeries, ColorType, createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import type {
  BacktestJob,
  HistoricalDataRequest,
  HistoricalDataResponse,
  KlineCandle,
} from './types/backtest';
import { downloadHistoricalData, fetchKlines } from './services/api';
import { mockJobs } from './services/mockData';
import './styles/app.css';

const statusItems = [
  { label: '引擎', value: 'Freqtrade', tone: 'warm' },
  { label: '后端', value: 'FastAPI', tone: 'cool' },
  { label: '图表', value: 'TradingView Lightweight Charts', tone: 'neutral' },
];

const roadmap = [
  '创建回测任务并管理参数预设',
  '实时查看运行日志与任务状态',
  '展示收益、回撤和交易明细',
  '逐步扩展到 Hyperopt 与批量回测',
];

const exchangeOptions = [
  { value: 'binance', label: 'Binance' },
  { value: 'okx', label: 'OKX' },
  { value: 'bybit', label: 'Bybit' },
  { value: 'gate', label: 'Gate.io' },
  { value: 'kraken', label: 'Kraken' },
];

const timeframeOptions = ['5m', '15m', '1h', '4h', '1d'];
const pairOptions = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];

const defaultHistoryForm: HistoricalDataRequest = {
  exchange: 'binance',
  pairs: ['BTC/USDT', 'ETH/USDT'],
  timeframes: ['1h', '4h'],
  timerange: '20240101-20240301',
};

function JobCard({ job }: { job: BacktestJob }) {
  return (
    <article className="job-card">
      <div className="job-head">
        <div>
          <p>{job.strategy}</p>
          <span>{job.timerange}</span>
        </div>
        <strong>{job.status}</strong>
      </div>
      <dl>
        <div>
          <dt>周期</dt>
          <dd>{job.timeframe}</dd>
        </div>
        <div>
          <dt>交易对</dt>
          <dd>{job.pairs.join(', ')}</dd>
        </div>
        <div>
          <dt>资金</dt>
          <dd>{job.stake_amount} USDT</dd>
        </div>
        <div>
          <dt>预设</dt>
          <dd>{job.config_preset}</dd>
        </div>
      </dl>
    </article>
  );
}

function TradingViewChart({ candles }: { candles: KlineCandle[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const chartData = useMemo(
    () =>
      candles.map((candle) => ({
        time: Math.floor(new Date(candle.time).getTime() / 1000) as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })),
    [candles],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const chart = createChart(container, {
      autoSize: true,
      height: 380,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(247, 239, 225, 0.72)',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.06)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.08)' },
      },
      crosshair: {
        vertLine: { color: 'rgba(246, 193, 119, 0.42)' },
        horzLine: { color: 'rgba(246, 193, 119, 0.28)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.12)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.12)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#3fd08f',
      downColor: '#ff7a66',
      borderVisible: false,
      wickUpColor: '#67f2b3',
      wickDownColor: '#ff9f8b',
      priceLineVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver(() => {
      chart.timeScale().fitContent();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      seriesRef.current = null;
      chartRef.current?.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || chartData.length === 0) {
      return;
    }

    seriesRef.current.setData(chartData);
    chartRef.current?.timeScale().fitContent();
  }, [chartData]);

  return <div ref={containerRef} className="tv-chart" aria-label="TradingView K线图" />;
}

function toggleValue(values: string[], nextValue: string) {
  return values.includes(nextValue) ? values.filter((item) => item !== nextValue) : [...values, nextValue];
}

export function App() {
  const [candles, setCandles] = useState<KlineCandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyForm, setHistoryForm] = useState(defaultHistoryForm);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyResult, setHistoryResult] = useState<HistoricalDataResponse | null>(null);
  const [historyError, setHistoryError] = useState('');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-03-01');

  useEffect(() => {
    let cancelled = false;

    async function loadKlines() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchKlines();
        if (!cancelled) {
          setCandles(data);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch klines');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadKlines();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const normalizedStart = startDate.replace(/-/g, '');
    const normalizedEnd = endDate.replace(/-/g, '');
    setHistoryForm((current) => ({
      ...current,
      timerange: `${normalizedStart}-${normalizedEnd}`,
    }));
  }, [startDate, endDate]);

  async function handleHistoryDownload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (historyForm.pairs.length === 0) {
      setHistoryError('请至少选择一个交易对');
      return;
    }

    if (historyForm.timeframes.length === 0) {
      setHistoryError('请至少选择一个周期');
      return;
    }

    if (endDate < startDate) {
      setHistoryError('结束时间不能早于开始时间');
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError('');
      const response = await downloadHistoricalData(historyForm);
      setHistoryResult(response);
    } catch (requestError) {
      setHistoryError(requestError instanceof Error ? requestError.message : 'Failed to download history');
      setHistoryResult(null);
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">frontend-design / 首版控制台视觉方向</p>
        <h1>为量化回测打造一块更像驾驶舱的 Web 控制台</h1>
        <p className="hero-copy">
          Lobster-Backtest 使用 Freqtrade 作为回测引擎，通过浏览器完成任务创建、运行监控与结果分析。
          当前已切换为 TradingView 开源 K 线图组件，并增加历史数据下载入口。
        </p>
        <div className="chip-row">
          {statusItems.map((item) => (
            <span key={item.label} className={`status-chip ${item.tone}`}>
              <strong>{item.label}</strong>
              <em>{item.value}</em>
            </span>
          ))}
        </div>
      </section>

      <section className="panel chart-panel">
        <div className="jobs-header">
          <div>
            <p className="panel-kicker">市场数据</p>
            <h2>BTC/USDT K 线预览</h2>
          </div>
          <span className="chart-badge">1h / 最近 48 根</span>
        </div>
        {loading ? <p className="chart-state">正在加载 K 线数据...</p> : null}
        {error ? <p className="chart-state error">{error}</p> : null}
        {!loading && !error && candles.length > 0 ? <TradingViewChart candles={candles} /> : null}
      </section>

      <section className="grid-panel history-layout">
        <article className="panel history-panel">
          <div>
            <p className="panel-kicker">历史数据</p>
            <h2>通过 Freqtrade 获取历史 K 线</h2>
          </div>
          <form className="history-form" onSubmit={handleHistoryDownload}>
            <label>
              <span>交易所</span>
              <select
                value={historyForm.exchange}
                onChange={(event) => setHistoryForm((current) => ({ ...current, exchange: event.target.value }))}
              >
                {exchangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="field-label">时间范围</span>
              <div className="date-range-grid">
                <label>
                  <span>开始时间</span>
                  <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                </label>
                <label>
                  <span>结束时间</span>
                  <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                </label>
              </div>
            </div>

            <div>
              <span className="field-label">周期</span>
              <div className="pill-grid">
                {timeframeOptions.map((timeframe) => {
                  const active = historyForm.timeframes.includes(timeframe);
                  return (
                    <button
                      key={timeframe}
                      type="button"
                      className={`pill-button ${active ? 'active' : ''}`}
                      onClick={() =>
                        setHistoryForm((current) => ({
                          ...current,
                          timeframes: toggleValue(current.timeframes, timeframe),
                        }))
                      }
                    >
                      {timeframe}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="field-label">交易对</span>
              <div className="pill-grid pair-grid">
                {pairOptions.map((pair) => {
                  const active = historyForm.pairs.includes(pair);
                  return (
                    <button
                      key={pair}
                      type="button"
                      className={`pill-button ${active ? 'active' : ''}`}
                      onClick={() =>
                        setHistoryForm((current) => ({
                          ...current,
                          pairs: toggleValue(current.pairs, pair),
                        }))
                      }
                    >
                      {pair}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="selection-summary">
              <span>{historyForm.exchange}</span>
              <span>{historyForm.timerange}</span>
              <span>{historyForm.timeframes.join(', ') || '未选周期'}</span>
              <span>{historyForm.pairs.join(', ') || '未选交易对'}</span>
            </div>

            <button type="submit" disabled={historyLoading}>
              {historyLoading ? '下载中...' : '获取历史数据'}
            </button>
          </form>
        </article>

        <article className="panel history-result-panel">
          <div>
            <p className="panel-kicker">执行结果</p>
            <h2>下载任务回执</h2>
          </div>
          {historyError ? <p className="chart-state error">{historyError}</p> : null}
          {!historyError && !historyResult ? <p className="chart-state">提交后会在这里显示执行结果。</p> : null}
          {historyResult ? (
            <div className="history-result">
              <div className="history-status-row">
                <span className={`history-status ${historyResult.used_fallback ? 'fallback' : 'success'}`}>
                  {historyResult.status}
                </span>
                <code>{historyResult.data_path}</code>
              </div>
              <div className="history-block">
                <strong>命令</strong>
                <pre>{historyResult.command.join(' ')}</pre>
              </div>
              <div className="history-block">
                <strong>输出</strong>
                <pre>{historyResult.stdout || '无输出'}</pre>
              </div>
              {historyResult.stderr ? (
                <div className="history-block">
                  <strong>错误输出</strong>
                  <pre>{historyResult.stderr}</pre>
                </div>
              ) : null}
            </div>
          ) : null}
        </article>
      </section>

      <section className="grid-panel">
        <article className="panel spotlight">
          <div>
            <p className="panel-kicker">初始化状态</p>
            <h2>项目骨架已就位</h2>
          </div>
          <ul>
            <li>后端已提供健康检查、任务接口和 K 线接口</li>
            <li>前端已接入真实请求并使用开源图表库渲染 K 线</li>
            <li>历史数据表单已支持交易所、时间范围、周期与交易对选择</li>
          </ul>
        </article>

        <article className="panel metrics">
          <p className="panel-kicker">下一步焦点</p>
          <div className="metric-block">
            <span>当前优先级</span>
            <strong>MVP 基础链路</strong>
          </div>
          <div className="metric-block">
            <span>设计调性</span>
            <strong>交易台 / 驾驶舱 / 仪表板</strong>
          </div>
          <div className="metric-block">
            <span>数据下载</span>
            <strong>Freqtrade download-data</strong>
          </div>
        </article>
      </section>

      <section className="panel roadmap-panel">
        <p className="panel-kicker">开发路线</p>
        <div className="roadmap-list">
          {roadmap.map((item, index) => (
            <div key={item} className="roadmap-item">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel jobs-panel">
        <div className="jobs-header">
          <div>
            <p className="panel-kicker">任务预览</p>
            <h2>回测任务看板</h2>
          </div>
          <button type="button">新建回测</button>
        </div>
        <div className="job-grid">
          {mockJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </main>
  );
}

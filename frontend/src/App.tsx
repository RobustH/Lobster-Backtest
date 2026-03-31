import type { BacktestJob } from './types/backtest';
import { mockJobs } from './services/mockData';
import './styles/app.css';

const statusItems = [
  { label: '引擎', value: 'Freqtrade', tone: 'warm' },
  { label: '后端', value: 'FastAPI', tone: 'cool' },
  { label: '前端', value: 'React + Vite', tone: 'neutral' },
];

const roadmap = [
  '创建回测任务并管理参数预设',
  '实时查看运行日志与任务状态',
  '展示收益、回撤和交易明细',
  '逐步扩展到 Hyperopt 与批量回测',
];

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

export function App() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">frontend-design / 首版控制台视觉方向</p>
        <h1>为量化回测打造一块更像驾驶舱的 Web 控制台</h1>
        <p className="hero-copy">
          Lobster-Backtest 使用 Freqtrade 作为回测引擎，通过浏览器完成任务创建、运行监控与结果分析。
          第一版优先打通基础回测链路，并逐步接入结果分析与实时状态推送。
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

      <section className="grid-panel">
        <article className="panel spotlight">
          <div>
            <p className="panel-kicker">初始化状态</p>
            <h2>项目骨架已就位</h2>
          </div>
          <ul>
            <li>后端已提供健康检查与回测任务占位接口</li>
            <li>前端已生成首版控制台主页和任务看板样式</li>
            <li>Freqtrade 工作区目录已按配置、策略、数据、结果、日志分层</li>
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
            <span>实时能力</span>
            <strong>WebSocket 日志流</strong>
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

# Lobster-Backtest Technical Plan

## 1. Goals

Lobster-Backtest will provide a web-based control panel for running and viewing Freqtrade backtests. The platform should let users manage strategies, launch backtests, inspect logs, and review historical results without working directly in the command line.

Primary goals:
- Use Freqtrade as the execution engine for backtesting and later hyperopt.
- Provide a browser-based UI instead of a desktop shell.
- Keep engine execution isolated behind an internal backend service.
- Support local-first deployment and leave room for later server deployment.

Non-goals for the first version:
- Multi-tenant account system.
- Live trading.
- Distributed task scheduling.
- Full strategy editor in browser.

## 2. Recommended Stack

### Backend
- Python 3.11+
- FastAPI for REST APIs and WebSocket endpoints
- Pydantic for request and response models
- SQLAlchemy + SQLite for metadata storage
- Background task runner:
  - Phase 1: simple subprocess job manager inside backend service
  - Phase 2: Celery/RQ if task volume grows

### Execution Engine
- Freqtrade CLI as the backtesting engine
- Standardized workspace directory for:
  - config files
  - strategy files
  - market data
  - backtest outputs
  - logs

### Frontend
- React
- Vite
- TypeScript
- A charting library such as ECharts or Recharts
- A table/grid component for orders, trades, and result comparison

### Storage
- SQLite for application metadata:
  - jobs
  - runs
  - strategy registry
  - saved parameter presets
  - result indexes
- File system for heavy artifacts:
  - Freqtrade result JSON files
  - exported CSVs
  - raw logs
  - generated charts or reports if needed

## 3. Why Web Instead of Tauri

Web is the better first step because:
- It separates UI from execution more cleanly.
- It is easier to deploy locally and later move to a server.
- Real-time logs and task history fit naturally into a browser dashboard.
- It avoids packaging complexity while the product shape is still changing.
- Future remote access and multi-user support are easier to add.

Tauri can still be reconsidered later if a desktop wrapper becomes necessary.

## 4. High-Level Architecture

```text
Browser UI
  |
  | REST / WebSocket
  v
FastAPI Service
  |
  | subprocess / job orchestration
  v
Freqtrade CLI
  |
  +-- config/
  +-- strategies/
  +-- user_data/data/
  +-- results/
  +-- logs/
```

Responsibilities:
- Frontend: configuration forms, task submission, status view, result visualization.
- Backend: validation, job lifecycle, command execution, result parsing, log streaming.
- Freqtrade: market data handling, strategy loading, backtesting, optimization.

## 5. Core Modules

### 5.1 Frontend Modules
- Dashboard
  - recent jobs
  - quick status cards
  - latest performance summaries
- Strategy Management
  - available strategy list
  - metadata display
  - basic enable/disable tagging
- Backtest Form
  - strategy selection
  - pair list
  - timeframe
  - timerange
  - stake and fee parameters
  - config preset selection
- Job Monitor
  - queued/running/completed/failed states
  - real-time logs
  - cancel action
- Result Center
  - backtest summaries
  - equity curve
  - drawdown chart
  - trade list
  - strategy comparison

### 5.2 Backend Modules
- API layer
  - REST endpoints
  - WebSocket log/status streaming
- Job service
  - create jobs
  - launch subprocesses
  - track pid and state
  - stop jobs safely
- Freqtrade adapter
  - build CLI commands
  - prepare runtime config
  - normalize outputs
- Result parser
  - parse Freqtrade output JSON
  - derive metrics for UI
- Storage layer
  - persist jobs and result index data
- Workspace manager
  - resolve paths
  - validate strategies/config files
  - keep outputs organized

## 6. Suggested Directory Layout

```text
Lobster-Backtest/
  docs/
    technical-plan.md
  backend/
    app/
      api/
      core/
      db/
      models/
      schemas/
      services/
      workers/
    tests/
    pyproject.toml
  frontend/
    src/
      components/
      pages/
      services/
      hooks/
      types/
    public/
    package.json
  workspace/
    freqtrade/
      config/
      strategies/
      data/
      results/
      logs/
  README.md
```

## 7. Backend API Proposal

### Basic endpoints
- `GET /api/health`
- `GET /api/strategies`
- `GET /api/strategies/{name}`
- `POST /api/backtests`
- `GET /api/backtests`
- `GET /api/backtests/{job_id}`
- `POST /api/backtests/{job_id}/cancel`
- `GET /api/backtests/{job_id}/result`
- `GET /api/presets`
- `POST /api/presets`

### WebSocket endpoints
- `GET /ws/jobs/{job_id}/logs`
- `GET /ws/jobs/{job_id}/status`

### Example backtest creation payload

```json
{
  "strategy": "SampleStrategy",
  "timeframe": "5m",
  "timerange": "20240101-20240301",
  "pairs": ["BTC/USDT", "ETH/USDT"],
  "stake_amount": 1000,
  "fee": 0.001,
  "config_preset": "default"
}
```

## 8. Backtest Execution Flow

1. User fills out the backtest form in the browser.
2. Frontend sends a request to `POST /api/backtests`.
3. Backend validates payload and creates a job record.
4. Backend generates or selects the runtime config.
5. Backend launches a Freqtrade subprocess.
6. Stdout and stderr are captured and streamed to WebSocket subscribers.
7. When the process exits, backend parses the result files.
8. Backend stores summary metrics and file references.
9. Frontend fetches result data and renders tables/charts.

## 9. Job Model Proposal

### Job lifecycle states
- `pending`
- `running`
- `completed`
- `failed`
- `cancelled`

### Suggested job fields
- `id`
- `job_type`
- `status`
- `strategy_name`
- `timeframe`
- `timerange`
- `pairs_json`
- `config_snapshot_path`
- `result_path`
- `log_path`
- `started_at`
- `finished_at`
- `exit_code`
- `error_message`
- `created_at`

## 10. Freqtrade Integration Notes

The backend should not expose raw command execution to the frontend. Instead, create a small adapter layer that translates validated request data into Freqtrade commands.

Example command pattern:

```bash
freqtrade backtesting \
  --config workspace/freqtrade/config/runtime.json \
  --strategy SampleStrategy \
  --timeframe 5m \
  --timerange 20240101-20240301
```

Integration rules:
- Generate runtime config files per job when overrides are needed.
- Store one log file per run.
- Store one result artifact bundle per run.
- Parse outputs after process completion rather than making frontend parse raw files.
- Restrict strategies to approved directories.

## 11. Frontend Pages

### Dashboard
- total jobs
- running jobs
- latest completed jobs
- aggregate performance snapshots

### Backtests
- create new backtest
- list and filter past jobs
- inspect one job with logs and result panels

### Strategies
- list strategies discovered in workspace
- show strategy metadata if available

### Settings
- workspace path
- default config preset
- exchange/data source settings
- result retention settings

## 12. Result Presentation

The UI should focus on turning Freqtrade output into readable trading insight.

Recommended result sections:
- Summary cards
  - total return
  - CAGR if available
  - max drawdown
  - Sharpe ratio
  - win rate
  - total trades
- Equity curve chart
- Drawdown chart
- Per-pair breakdown table
- Trade history table
- Parameter snapshot panel
- Raw artifact download links

## 13. Security and Safety

- Do not allow arbitrary shell commands from the frontend.
- Constrain all file access to the workspace directory.
- Validate strategy names and config preset names.
- Limit concurrent backtest jobs in phase 1.
- Sanitize log streaming and error messages.
- Use internal job IDs rather than exposing direct file system paths.

## 14. Phase Plan

### Phase 1: MVP
- backend service skeleton
- frontend dashboard skeleton
- create/list backtest jobs
- run one backtest at a time
- stream logs
- display parsed result summary

### Phase 2: Practical Use
- multiple saved presets
- strategy discovery and metadata view
- historical result comparison
- result export
- basic job cancellation

### Phase 3: Advanced Analysis
- hyperopt support
- batch jobs
- strategy comparison dashboard
- richer analytics and charts
- optional remote worker execution

## 15. Recommended MVP Scope

To keep delivery tight, the first usable milestone should include only:
- local deployment
- one backend service
- one web frontend
- SQLite metadata database
- one backtest form
- one job list page
- one job detail page with logs and result summary

This is enough to validate the product direction before investing in optimization or desktop packaging.

## 16. Implementation Recommendation

Start with this concrete combination:
- Backend: FastAPI
- Engine: Freqtrade
- Frontend: React + Vite + TypeScript
- DB: SQLite
- Realtime: WebSocket
- Task execution: in-process subprocess manager for MVP

This gives the shortest path to a working product while keeping the architecture clean enough for later evolution.

# Lobster-Backtest

Lobster-Backtest is a web-based backtesting control panel built around Freqtrade. The goal is to provide a clean browser UI for launching backtests, monitoring logs, and reviewing results without operating the engine directly from the command line.

## Planned Architecture

- `backend/`: FastAPI service for APIs, job orchestration, result parsing, and log streaming
- `frontend/`: React + Vite web UI for task creation, monitoring, and analytics
- `workspace/freqtrade/`: Freqtrade configs, strategies, data, results, and logs
- `docs/`: technical design and implementation notes

## Recommended Stack

- Backend: Python 3.11+, FastAPI, Pydantic, SQLAlchemy, SQLite
- Engine: Freqtrade CLI
- Frontend: React, Vite, TypeScript
- Realtime: WebSocket
- Storage: SQLite for metadata, file system for artifacts

## MVP Scope

The first usable version should include:
- backtest job creation from a browser form
- backtest job list and status tracking
- real-time log streaming
- parsed result summaries and charts
- local-first deployment

## Documents

- Technical plan: `docs/technical-plan.md`

## Roadmap

### Phase 1
- initialize backend and frontend projects
- create backtest job APIs
- run Freqtrade backtests through backend-managed subprocesses
- show logs and summary results in the web UI

### Phase 2
- add config presets and strategy management
- add historical result comparison
- support job cancellation and exports

### Phase 3
- add hyperopt workflows
- support batch execution and richer analytics
- prepare for optional remote execution nodes

# Lobster-Backtest 技术方案

## 1. 项目目标

Lobster-Backtest 将提供一个基于 Web 的 Freqtrade 回测控制台。平台应当支持用户管理策略、发起回测、查看日志，并回顾历史结果，而不需要直接在命令行中操作。

核心目标：
- 使用 Freqtrade 作为回测执行引擎，后续可扩展到 Hyperopt。
- 提供浏览器界面，而不是桌面壳程序。
- 将引擎执行能力隔离在内部后端服务之后。
- 优先支持本地部署，同时为后续服务化部署预留空间。

第一版非目标：
- 多租户账户系统。
- 实盘交易。
- 分布式任务调度。
- 浏览器内完整策略编辑器。

## 2. 推荐技术栈

### 后端
- Python 3.11+
- FastAPI：提供 REST API 和 WebSocket 接口
- Pydantic：定义请求和响应模型
- SQLAlchemy + SQLite：存储应用元数据
- 后台任务执行：
  - 第一阶段：在后端服务内使用轻量子进程任务管理器
  - 第二阶段：任务规模扩大后再引入 Celery 或 RQ

### 执行引擎
- 使用 Freqtrade CLI 作为回测执行引擎
- 采用统一的工作目录结构管理：
  - 配置文件
  - 策略文件
  - 市场数据
  - 回测输出
  - 日志文件

### 前端
- React
- Vite
- TypeScript
- 图表库可选 ECharts 或 Recharts
- 表格组件用于展示订单、交易和结果对比

### 存储
- SQLite 用于存放应用元数据：
  - 任务记录
  - 运行记录
  - 策略注册信息
  - 参数预设
  - 结果索引
- 文件系统用于存放大体积产物：
  - Freqtrade 结果 JSON
  - 导出 CSV
  - 原始日志
  - 生成的图表或报告

## 3. 为什么先用 Web，而不是 Tauri

现阶段优先使用 Web，原因如下：
- UI 与执行层职责分离更清晰。
- 本地运行简单，后续迁移到服务器也更容易。
- 实时日志、任务历史和结果仪表盘天然适合浏览器。
- 在产品形态未稳定前，可以避免桌面打包与分发的额外复杂度。
- 未来若要支持远程访问或多用户使用，Web 方案扩展更自然。

如果后期确实需要桌面封装，可以再评估是否增加 Tauri 包装层。

## 4. 高层架构

```text
浏览器前端
  |
  | REST / WebSocket
  v
FastAPI 后端服务
  |
  | 子进程 / 任务编排
  v
Freqtrade CLI
  |
  +-- config/
  +-- strategies/
  +-- user_data/data/
  +-- results/
  +-- logs/
```

各层职责：
- 前端：配置表单、任务提交、状态查看、结果可视化。
- 后端：参数校验、任务生命周期管理、命令执行、结果解析、日志推送。
- Freqtrade：市场数据处理、策略加载、回测执行、优化计算。

## 5. 核心模块划分

### 5.1 前端模块
- 仪表盘
  - 最近任务
  - 快速状态卡片
  - 最新回测表现摘要
- 策略管理
  - 策略列表
  - 策略元信息展示
  - 基础启用/标记能力
- 回测创建表单
  - 策略选择
  - 交易对选择
  - 时间周期
  - 时间范围
  - 资金和手续费参数
  - 配置预设选择
- 任务监控
  - 排队 / 运行中 / 已完成 / 失败状态
  - 实时日志
  - 取消任务
- 结果中心
  - 回测摘要
  - 资金曲线
  - 回撤曲线
  - 交易列表
  - 策略对比

### 5.2 后端模块
- API 层
  - REST 接口
  - WebSocket 日志与状态推送
- 任务服务
  - 创建任务
  - 启动子进程
  - 跟踪进程 ID 和状态
  - 安全停止任务
- Freqtrade 适配层
  - 生成 CLI 命令
  - 准备运行时配置
  - 统一输出格式
- 结果解析层
  - 解析 Freqtrade 输出 JSON
  - 为前端生成摘要指标
- 存储层
  - 保存任务和结果索引数据
- 工作区管理器
  - 解析路径
  - 校验策略和配置文件
  - 管理输出目录结构

## 6. 建议目录结构

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

## 7. 后端 API 设计建议

### 基础接口
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

### WebSocket 接口
- `GET /ws/jobs/{job_id}/logs`
- `GET /ws/jobs/{job_id}/status`

### 创建回测任务示例请求

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

## 8. 回测执行流程

1. 用户在浏览器中填写回测表单。
2. 前端向 `POST /api/backtests` 发送请求。
3. 后端校验参数并创建任务记录。
4. 后端生成或选取运行时配置。
5. 后端启动 Freqtrade 子进程。
6. 实时捕获 stdout 和 stderr，并通过 WebSocket 推送给订阅者。
7. 进程结束后，后端解析结果文件。
8. 后端保存摘要指标和结果文件引用。
9. 前端拉取结果数据并渲染图表与表格。

## 9. 任务模型建议

### 任务状态
- `pending`：待执行
- `running`：执行中
- `completed`：已完成
- `failed`：执行失败
- `cancelled`：已取消

### 建议字段
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

## 10. Freqtrade 集成说明

后端不应向前端暴露原始命令执行能力，而应通过一个适配层把已校验的请求参数转换为 Freqtrade 命令。

命令示例：

```bash
freqtrade backtesting \
  --config workspace/freqtrade/config/runtime.json \
  --strategy SampleStrategy \
  --timeframe 5m \
  --timerange 20240101-20240301
```

集成规则：
- 当任务存在覆盖参数时，为每次任务生成独立运行时配置。
- 每次运行保存一份独立日志文件。
- 每次运行保存一份独立结果产物集合。
- 在进程结束后统一解析结果，而不是让前端直接读取原始文件。
- 仅允许从受控策略目录加载策略。

## 11. 前端页面规划

### 仪表盘
- 总任务数
- 运行中任务数
- 最近完成任务
- 聚合后的表现快照

### 回测页
- 创建新回测任务
- 列表查看与筛选历史任务
- 查看单个任务的日志和结果面板

### 策略页
- 展示工作区中发现的策略
- 如果可用，展示策略元信息

### 设置页
- 工作区路径
- 默认配置预设
- 交易所/数据源设置
- 结果保留策略

## 12. 结果展示建议

UI 应聚焦于把 Freqtrade 原始输出转化为可读的交易分析结果。

建议展示内容：
- 摘要卡片
  - 总收益率
  - 年化收益率（如可得）
  - 最大回撤
  - Sharpe 比率
  - 胜率
  - 总交易数
- 资金曲线图
- 回撤曲线图
- 分交易对表现表
- 交易历史表
- 参数快照面板
- 原始产物下载链接

## 13. 安全与约束

- 不允许前端发起任意 Shell 命令。
- 所有文件访问都限制在工作区目录内。
- 对策略名和配置预设名做严格校验。
- 第一阶段限制并发回测数量。
- 对日志输出和错误信息做适当清洗。
- 对外仅暴露内部任务 ID，而不是文件系统真实路径。

## 14. 阶段规划

### 第一阶段：MVP
- 后端服务骨架
- 前端控制台骨架
- 创建与查询回测任务
- 一次只运行一个回测任务
- 实时日志推送
- 展示解析后的结果摘要

### 第二阶段：实用化
- 多个参数预设
- 策略发现与元信息展示
- 历史结果对比
- 结果导出
- 基础任务取消能力

### 第三阶段：高级分析
- Hyperopt 支持
- 批量任务
- 策略对比仪表盘
- 更丰富的分析图表
- 可选远程执行节点

## 15. 推荐的 MVP 边界

为了尽快交付一个可验证方向的版本，第一阶段建议只包含：
- 本地部署
- 单个后端服务
- 单个 Web 前端
- SQLite 元数据库
- 一个回测创建表单
- 一个任务列表页
- 一个包含日志和结果摘要的任务详情页

这已经足够验证产品方向，再决定是否继续投入优化、批处理和桌面封装。

## 16. 实施建议

建议先按以下组合落地：
- 后端：FastAPI
- 引擎：Freqtrade
- 前端：React + Vite + TypeScript
- 数据库：SQLite
- 实时通信：WebSocket
- 任务执行：MVP 阶段先使用进程内子进程管理器

这条路线能以较低复杂度尽快做出可用版本，同时保留后续扩展空间。

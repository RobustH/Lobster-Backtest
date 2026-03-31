# Lobster-Backtest

Lobster-Backtest 是一个围绕 Freqtrade 构建的 Web 回测控制台项目。目标是通过浏览器界面完成回测任务创建、日志查看和结果分析，而不是直接在命令行中操作回测引擎。

## 规划中的项目结构

- `backend/`：基于 FastAPI 的后端服务，负责接口、任务编排、结果解析和日志推送
- `frontend/`：基于 React + Vite 的 Web 前端，负责任务创建、状态查看和结果展示
- `workspace/freqtrade/`：存放 Freqtrade 配置、策略、数据、结果和日志
- `docs/`：技术设计与实施文档

## 推荐技术栈

- 后端：Python 3.11+、FastAPI、Pydantic、SQLAlchemy、SQLite
- 回测引擎：Freqtrade CLI
- 前端：React、Vite、TypeScript
- 实时通信：WebSocket
- 存储：SQLite 存元数据，文件系统存结果产物

## MVP 范围

第一版可用版本建议先包含以下能力：
- 通过浏览器表单创建回测任务
- 查看回测任务列表与状态
- 实时查看日志输出
- 展示解析后的回测摘要和图表
- 支持本地优先部署

## 相关文档

- 技术方案：`docs/technical-plan.md`

## 路线图

### 第一阶段
- 初始化前后端项目骨架
- 建立回测任务接口
- 通过后端托管的子进程运行 Freqtrade 回测
- 在 Web 页面展示日志和结果摘要

### 第二阶段
- 增加配置预设和策略管理
- 增加历史结果对比
- 支持任务取消与结果导出

### 第三阶段
- 增加 Hyperopt 工作流
- 支持批量执行和更丰富的分析能力
- 为可选的远程执行节点做准备

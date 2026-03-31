# 后端说明

## 当前状态

当前已完成后端基础骨架：
- FastAPI 应用入口
- 健康检查接口
- 基础目录划分
- 最小测试样例

## 本地安装建议

优先使用虚拟环境安装依赖：

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements-dev.txt
uvicorn app.main:app --app-dir backend --reload
```

如果系统缺少 `venv` 组件，需要先安装对应系统包后再创建虚拟环境。

## 当前接口

- `GET /api/health`

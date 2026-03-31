from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]
WORKSPACE_ROOT = PROJECT_ROOT / "workspace" / "freqtrade"
LOG_ROOT = WORKSPACE_ROOT / "logs"
RESULT_ROOT = WORKSPACE_ROOT / "results"
STRATEGY_ROOT = WORKSPACE_ROOT / "strategies"
CONFIG_ROOT = WORKSPACE_ROOT / "config"
DATA_ROOT = WORKSPACE_ROOT / "data"

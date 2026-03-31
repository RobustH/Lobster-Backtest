from pydantic import BaseModel, Field


class BacktestCreateRequest(BaseModel):
    strategy: str = Field(min_length=1, description="策略名称")
    timeframe: str = Field(min_length=1, description="时间周期")
    timerange: str = Field(min_length=1, description="回测时间范围")
    pairs: list[str] = Field(min_length=1, description="交易对列表")
    stake_amount: float = Field(gt=0, description="单次投入资金")
    fee: float = Field(ge=0, description="手续费")
    config_preset: str = Field(min_length=1, description="配置预设")


class BacktestJobSummary(BaseModel):
    id: str
    status: str
    strategy: str
    timeframe: str
    timerange: str
    pairs: list[str]
    stake_amount: float
    fee: float
    config_preset: str


class KlineCandle(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class HistoricalDataRequest(BaseModel):
    exchange: str = Field(default="binance", min_length=1, description="交易所")
    pairs: list[str] = Field(min_length=1, description="交易对列表")
    timeframes: list[str] = Field(min_length=1, description="周期列表")
    timerange: str = Field(min_length=1, description="历史数据时间范围")


class HistoricalDataResponse(BaseModel):
    status: str
    command: list[str]
    stdout: str
    stderr: str
    data_path: str
    used_fallback: bool

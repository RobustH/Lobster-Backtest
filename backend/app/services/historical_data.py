from __future__ import annotations

import json
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

from app.core.config import DATA_ROOT
from app.schemas.backtest import HistoricalDataRequest, HistoricalDataResponse


@dataclass(slots=True)
class HistoricalDataService:
    data_root: Path = DATA_ROOT

    def download(self, payload: HistoricalDataRequest) -> HistoricalDataResponse:
        self.data_root.mkdir(parents=True, exist_ok=True)
        freqtrade_bin = shutil.which('freqtrade')
        command = self._build_command(payload)

        if freqtrade_bin:
            completed = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=False,
                cwd=self.data_root.parent,
            )
            return HistoricalDataResponse(
                status='completed' if completed.returncode == 0 else 'failed',
                command=command,
                stdout=completed.stdout.strip(),
                stderr=completed.stderr.strip(),
                data_path=str(self.data_root),
                used_fallback=False,
            )

        fallback_file = self._write_stub(payload)
        return HistoricalDataResponse(
            status='stubbed',
            command=command,
            stdout=f'Freqtrade not found. Stub manifest written to {fallback_file}',
            stderr='',
            data_path=str(self.data_root),
            used_fallback=True,
        )

    def _build_command(self, payload: HistoricalDataRequest) -> list[str]:
        return [
            'freqtrade',
            'download-data',
            '--exchange',
            payload.exchange,
            '--pairs',
            *payload.pairs,
            '--timeframes',
            *payload.timeframes,
            '--timerange',
            payload.timerange,
            '--datadir',
            str(self.data_root),
        ]

    def _write_stub(self, payload: HistoricalDataRequest) -> Path:
        manifest_path = self.data_root / 'download-request.json'
        manifest_path.write_text(
            json.dumps(
                {
                    'exchange': payload.exchange,
                    'pairs': payload.pairs,
                    'timeframes': payload.timeframes,
                    'timerange': payload.timerange,
                    'note': 'Install freqtrade to execute the generated command.',
                },
                indent=2,
            ),
            encoding='utf-8',
        )
        return manifest_path


historical_data_service = HistoricalDataService()

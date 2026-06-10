from __future__ import annotations

from pathlib import Path

import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR
SCALER_DIR = BASE_DIR / 'scalers'
METRICS_DIR = BASE_DIR / 'metrics'

SCALER_DIR.mkdir(parents=True, exist_ok=True)
METRICS_DIR.mkdir(parents=True, exist_ok=True)


def model_path(symbol: str) -> Path:
    return MODEL_DIR / f'lstm_{symbol.upper()}.h5'


def scaler_path(symbol: str) -> Path:
    return SCALER_DIR / f'scaler_{symbol.upper()}.pkl'


def metrics_path(symbol: str) -> Path:
    return METRICS_DIR / f'metrics_{symbol.upper()}.json'


def create_sequences(values: np.ndarray, lookback: int = 60) -> tuple[np.ndarray, np.ndarray]:
    features, targets = [], []
    for index in range(lookback, len(values)):
        features.append(values[index - lookback:index])
        targets.append(values[index])
    return np.array(features), np.array(targets)


def build_model(input_shape: tuple[int, int]) -> Sequential:
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=input_shape),
        LSTM(50),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model
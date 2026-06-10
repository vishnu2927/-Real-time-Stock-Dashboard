from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler

from model.utils import scaler_path


def download_ohlcv(symbol: str) -> pd.DataFrame:
    """Download two years of daily OHLCV data for a symbol."""
    frame = yf.download(symbol, period='2y', interval='1d', auto_adjust=True, progress=False)
    if frame.empty:
      raise ValueError(f'No historical data returned for {symbol}')

    frame = frame[['Open', 'High', 'Low', 'Close', 'Volume']].dropna().copy()
    frame.index = pd.to_datetime(frame.index)
    return frame


def prepare_datasets(symbol: str, lookback: int = 60):
    """Prepare normalized training and testing arrays for the LSTM model."""
    frame = download_ohlcv(symbol)
    close_values = frame[['Close']].astype('float32').values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(close_values)

    joblib.dump(scaler, scaler_path(symbol))
    joblib.dump(scaler, Path(__file__).resolve().parents[1] / 'scaler.pkl')

    features, targets = [], []
    for index in range(lookback, len(scaled)):
        features.append(scaled[index - lookback:index])
        targets.append(scaled[index])

    features = np.array(features, dtype=np.float32)
    targets = np.array(targets, dtype=np.float32)

    split_index = max(int(len(features) * 0.8), 1)
    x_train, x_test = features[:split_index], features[split_index:]
    y_train, y_test = targets[:split_index], targets[split_index:]

    return x_train, x_test, y_train, y_test, scaler, frame

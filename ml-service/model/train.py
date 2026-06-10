import numpy as np
import joblib
import os
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'saved')
os.makedirs(MODELS_DIR, exist_ok=True)

def train_model(symbol: str):
    try:
        import yfinance as yf
        df = yf.download(symbol, period="2y", progress=False)
        prices = df['Close'].dropna().values.flatten()
    except Exception:
        prices = np.linspace(100, 200, 200) + np.random.randn(200) * 5

    X, y = [], []
    for i in range(1, len(prices)):
        X.append([i, i**2, i % 5])
        y.append(prices[i])

    X = np.array(X)
    y = np.array(y)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)

    joblib.dump(model, os.path.join(MODELS_DIR, f"{symbol}_model.pkl"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, f"{symbol}_scaler.pkl"))
    print(f"[ml] Model trained for {symbol}")
import numpy as np
import joblib
import os
from datetime import datetime, timedelta

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'saved')
os.makedirs(MODELS_DIR, exist_ok=True)

def predict_prices(symbol: str, days: int = 7):
    model_path = os.path.join(MODELS_DIR, f"{symbol}_model.pkl")
    scaler_path = os.path.join(MODELS_DIR, f"{symbol}_scaler.pkl")

    if not os.path.exists(model_path):
        from model.train import train_model
        train_model(symbol)

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    predictions = []
    base_date = datetime.now()

    for i in range(1, days + 1):
        day_features = np.array([[i, i**2, i % 5]])
        scaled = scaler.transform(day_features)
        price = float(model.predict(scaled)[0])
        predictions.append({
            "date": (base_date + timedelta(days=i)).strftime("%Y-%m-%d"),
            "predictedPrice": round(price, 2),
            "confidenceScore": round(max(0.5, 0.95 - i * 0.03), 2)
        })

    return predictions
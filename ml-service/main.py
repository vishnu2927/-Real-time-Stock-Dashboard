from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from model.predict import predict_prices
import os

app = FastAPI(title="Stock Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/predict/{symbol}")
def predict(symbol: str, days: int = 7):
    try:
        predictions = predict_prices(symbol.upper(), days)
        return {"symbol": symbol.upper(), "predictions": predictions}
    except Exception as e:
        return {"error": str(e)}

@app.on_event("startup")
async def startup():
    top_stocks = ["AAPL", "TSLA", "GOOGL"]
    for symbol in top_stocks:
        try:
            from model.train import train_model
            train_model(symbol)
        except Exception as e:
            print(f"[ml] Could not pre-train {symbol}: {e}")
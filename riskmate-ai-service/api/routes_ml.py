from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
import sys
import os

from services.lstm_service import train_and_save_model
from data.ml_processor import prepare_data_for_lstm
import yfinance as yf

router = APIRouter(prefix="/api/ml", tags=["machine-learning"])

def train_model_task(ticker: str):
    clean_ticker = ticker.upper().strip()
    print(f"Починаю фонове тренування LSTM для {clean_ticker}...")
    try:
        from infrastructure.data_provider import YFinanceProvider
        provider = YFinanceProvider()
        df = provider.fetch_history(clean_ticker, period="5y")
        
        if df.empty:
            print(f"Помилка: Немає даних для {clean_ticker}")
            return
            
        # Ця функція очікується в ml_processor або прямо тут.
        # В lstm_service.py вона імпортується як from data.ml_processor import prepare_data_for_lstm
        from data.ml_processor import prepare_data_for_lstm
        X_train, y_train, scaler, raw_data = prepare_data_for_lstm(df)
        
        train_and_save_model(X_train, y_train, ticker=clean_ticker, epochs=10)
        print(f"✅ Фонове тренування для {clean_ticker} завершено успішно!")
    except Exception as e:
        print(f"❌ Помилка фонового тренування {clean_ticker}: {e}")

@router.post("/train/{ticker}")
def train_model(ticker: str, background_tasks: BackgroundTasks):
    clean_ticker = ticker.upper().strip()
    background_tasks.add_task(train_model_task, clean_ticker)
    return {"message": f"Почато тренування моделі для {clean_ticker}. Це може зайняти 1-2 хвилини."}

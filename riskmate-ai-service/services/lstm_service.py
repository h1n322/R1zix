import os
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input 

def build_lstm_model(input_shape):
    print("Будую архітектуру LSTM моделі...")
    model = Sequential()
    
    model.add(Input(shape=input_shape))
    model.add(LSTM(units=50, return_sequences=True))
    model.add(Dropout(0.2))
    
    model.add(LSTM(units=50, return_sequences=False))
    model.add(Dropout(0.2))
    
    model.add(Dense(units=25))
    model.add(Dense(units=1)) 
    
    model.compile(optimizer='adam', loss='mean_squared_error')
    print(" Модель успішно побудована!")
    return model

def train_and_save_model(X_train, y_train, ticker="AAPL", epochs=10, batch_size=32):
    os.makedirs('models', exist_ok=True)
    model = build_lstm_model((X_train.shape[1], 1))
    
    print(f"Починаю тренування моделі для {ticker}. Це може зайняти хвилину...")
    model.fit(X_train, y_train, batch_size=batch_size, epochs=epochs)
    
    model_path = f'models/{ticker}_lstm_model.keras'
    model.save(model_path)
    
    print(f"Модель успішно збережена за адресою: {model_path}")
    return model

if __name__ == "__main__":
    import sys
    import os
    import yfinance as yf
    
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from data.ml_processor import prepare_data_for_lstm
    top_tickers = [
        "AAPL", "MSFT", "NVDA", "TSLA", "GOOGL", # Великі технології
        "AMZN", "META", "NFLX",                  # Інтернет та розваги
        "JPM", "V", "MA", "BAC",                 # Фінанси та банки
        "JNJ", "UNH", "LLY",                     # Медицина та фармакологія
        "WMT", "PG", "KO", "PEP",                # Ритейл та споживчі товари
        "XOM"                                    # Енергетика
    ]
    
    print(f"Запускаю тренування ШІ для {len(top_tickers)} ")
    
    for ticker in top_tickers:
        print(f"\n{'='*50}")
        print(f" Створюєммо мереж: {ticker}")
        print(f"{'='*50}")
        
        try:
            df = yf.Ticker(ticker).history(period="5y")
            
            if df.empty:
                print(f"Немає даних для {ticker}, пропускаємо...")
                continue
                
            X_train, y_train, scaler, raw_data = prepare_data_for_lstm(df)
            
            train_and_save_model(X_train, y_train, ticker=ticker, epochs=10)
            
        except Exception as e:
            print(f"❌ Помилка під час тренування {ticker}: {e}")

    print("\n ФАБРИКА ШІ ЗАВЕРШИЛА РОБОТУ! Всі 20 моделей збережено ")
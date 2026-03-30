import numpy as np
import yfinance as yf
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler

def predict_tomorrow_price(ticker="AAPL", look_back=60):
    print(f"🔮 Запускаю Штучний Інтелект для прогнозу {ticker} на завтра...")

    # 1. Завантажуємо історичні дані (беремо за рік, щоб правильно налаштувати масштабування)
    df = yf.Ticker(ticker).history(period="1y")
    data = df.filter(['Close']).values

    # 2. Масштабуємо дані (ШІ розуміє тільки цифри від 0 до 1)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)

    # 3. Беремо рівно останні 60 днів (це те "вікно", яке ми покажемо нейромережі)
    last_60_days = scaled_data[-look_back:]

    # 4. Перетворюємо у 3D формат, який очікує LSTM: [1 зразок, 60 днів, 1 ознака]
    X_test = np.reshape(last_60_days, (1, last_60_days.shape[0], 1))

    # 5. Завантажуємо наш натренований "мозок"
    model_path = f'models/{ticker}_lstm_model.keras'
    try:
        model = load_model(model_path)
    except Exception as e:
        print(f"❌ Помилка: Не знайдено модель для {ticker}. Спочатку натренуйте її!")
        return None

    # 6. РОБИМО ПРОГНОЗ! (він буде у масштабі від 0 до 1)
    predicted_scaled_price = model.predict(X_test)

    # 7. Розшифровуємо прогноз назад у реальні долари
    predicted_price = scaler.inverse_transform(predicted_scaled_price)
    final_price = predicted_price[0][0]

    print(f"✅ Прогноз успішно згенеровано!")
    print(f"💵 Очікувана ціна {ticker} на завтра: ${final_price:.2f}")
    
    return final_price

if __name__ == "__main__":
    predict_tomorrow_price("AAPL")
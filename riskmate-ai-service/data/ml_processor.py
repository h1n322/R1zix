from utils.logger import logger
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def prepare_data_for_lstm(df, look_back=60):
    """
    Готує сирі біржові дані для навчання нейромережі LSTM.
    look_back - скільки попередніх днів беремо для прогнозу наступного.
    """
    logger.info("⚙️ Починаю підготовку даних для LSTM...")
    
    # 1. Беремо тільки колонку 'Close' (ціна закриття)
    data = df.filter(['Close']).values
    
    # 2. Масштабуємо дані: стискаємо всі ціни в діапазон від 0 до 1.
    # Це критично важливо для стабільного навчання нейромережі!
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    # 3. Нарізаємо дані на "вікна" (послідовності)
    X, y = [], []
    for i in range(look_back, len(scaled_data)):
        # X - масив з 60 попередніх днів
        X.append(scaled_data[i-look_back:i, 0])
        # y - ціна на 61-й день (те, що ми хочемо навчитися вгадувати)
        y.append(scaled_data[i, 0])
        
    # Перетворюємо списки в масиви numpy (формат, який вимагає TensorFlow)
    X, y = np.array(X), np.array(y)
    
    # 4. LSTM очікує дані у 3D форматі: [кількість_зразків, часові_кроки, кількість_ознак]
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))
    
    logger.info(f"✅ Дані підготовлено! Створено {X.shape[0]} вікон по {look_back} днів.")
    return X, y, scaler, data

# Для тестування файлу напряму
if __name__ == "__main__":
    import yfinance as yf
    
    # Завантажуємо дані за 2 роки для тесту
    logger.info("Завантажую тестові дані AAPL за 2 роки...")
    df = yf.Ticker("AAPL").history(period="2y")
    
    # Проганяємо через нашу функцію
    X_train, y_train, scaler, raw_data = prepare_data_for_lstm(df)
    
    logger.info(f"Форма X (вхідні дані): {X_train.shape}")
    logger.info(f"Форма y (відповіді): {y_train.shape}")
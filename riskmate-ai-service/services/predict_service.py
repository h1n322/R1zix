from utils.logger import logger
"""
PredictService — LSTM прогноз ціни на завтра.

Обгортає predict_tomorrow_price у клас,
щоб можна було передати через DI і підмінити у тестах.
"""
import numpy as np
from sklearn.preprocessing import MinMaxScaler

from infrastructure.data_provider import YFinanceProvider


class PredictService:
    def __init__(self, provider: YFinanceProvider, models_dir: str = "models"):
        self._provider = provider
        self._models_dir = models_dir

    def predict_tomorrow(self, ticker: str, look_back: int = 60) :
        """
        Завантажує натреновану LSTM модель і робить прогноз ціни на завтра.
        Повертає float або None якщо модель не знайдена.
        """
        # Імпортуємо tensorflow тільки тут, щоб не гальмувати старт сервера
        try:
            from tensorflow.keras.models import load_model
        except ImportError:
            logger.error("❌ TensorFlow не встановлено")
            return None

        logger.info(f"🔮 Запускаю LSTM прогноз для {ticker}...")

        # 1. Дані за рік для правильного масштабування
        df = self._provider.fetch_history(ticker, period="1y")
        data = df["Close"].values.reshape(-1, 1)

        # 2. Масштабуємо в діапазон [0, 1]
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(data)

        # 3. Формуємо вікно з останніх look_back днів
        last_window = scaled_data[-look_back:]
        X_test = np.reshape(last_window, (1, last_window.shape[0], 1))

        # 4. Завантажуємо модель
        model_path = f"{self._models_dir}/{ticker}_lstm_model.keras"
        try:
            model = load_model(model_path)
        except Exception:
            logger.error(f"❌ Модель {model_path} не знайдена. Спочатку натренуйте її.")
            return None

        # 5. Прогноз і зворотне масштабування
        predicted_scaled = model.predict(X_test)
        predicted_price = float(scaler.inverse_transform(predicted_scaled)[0][0])

        logger.info(f"✅ Прогноз {ticker}: ${predicted_price:.2f}")
        return predicted_price
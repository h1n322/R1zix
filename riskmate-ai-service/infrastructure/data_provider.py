import time
from datetime import datetime

import yfinance as yf
import pandas as pd
import numpy as np
import requests_cache

# Глобально кешуємо всі HTTP запити для уникнення Rate Limit (кеш живе 1 годину)
requests_cache.install_cache('yfinance_cache', expire_after=3600)


class YFinanceProvider:
    """
    Єдине місце у проєкті, де живе yfinance.
    Всі сервіси отримують дані тільки через цей клас.
    Завдяки цьому, якщо yfinance зміниться або ми захочемо
    підмінити джерело даних — змінюємо тільки тут.
    """

    def __init__(self, retries: int = 3, retry_delay: float = 5.0):
        self._retries = retries
        self._retry_delay = retry_delay
        self._cache: dict = {}

    # ------------------------------------------------------------------
    # Публічні методи
    # ------------------------------------------------------------------

    def fetch_history(self, ticker: str, period: str) -> pd.DataFrame:
        """
        Повертає повний OHLCV DataFrame для одного тикера.
        Колонки: Open, High, Low, Close, Volume
        """
        cache_key = f"history_{ticker}_{period}"
        if cache_key in self._cache:
            print(f"📦 Кеш: history {ticker}")
            return self._cache[cache_key]

        for attempt in range(self._retries):
            try:
                df = yf.Ticker(ticker).history(period=period)
                if not df.empty:
                    self._cache[cache_key] = df
                    return df
            except Exception as e:
                print(f"⚠️  Спроба {attempt + 1}/{self._retries} для {ticker}: {e}")
            delay = self._retry_delay * (2 ** attempt)
            print(f"⏳ Чекаємо {delay:.0f}с...")
            time.sleep(delay)
            
        print(f"🔄 Генеруємо MOCK-дані для {ticker} через Rate Limit...")
        import numpy as np
        dates = pd.date_range(end=pd.Timestamp.today().normalize(), periods=252 * 5, freq='B')
        np.random.seed(hash(ticker) % (2**32))
        returns = np.random.normal(0.0005, 0.02, len(dates))
        prices = 100 * np.exp(np.cumsum(returns))
        df = pd.DataFrame({
            "Open": prices * np.random.uniform(0.99, 1.01, len(dates)),
            "High": prices * np.random.uniform(1.0, 1.02, len(dates)),
            "Low": prices * np.random.uniform(0.98, 1.0, len(dates)),
            "Close": prices,
            "Volume": np.random.randint(100000, 10000000, len(dates))
        }, index=dates)
        self._cache[cache_key] = df
        return df

    def fetch_close(self, ticker: str, period: str) -> pd.Series:
        """
        Повертає тільки ціни закриття (Close) як Series.
        """
        df = self.fetch_history(ticker, period)
        return df["Close"].squeeze()

    def fetch_multi_close(self, tickers: list[str], period: str) -> pd.DataFrame:
        """
        Повертає DataFrame з цінами закриття для кількох тикерів.
        Колонки = тикери, рядки = дати.
        """
        cache_key = f"multi_{'_'.join(sorted(tickers))}_{period}"
        if cache_key in self._cache:
            print(f"📦 Кеш: multi_close {tickers}")
            return self._cache[cache_key]

        for attempt in range(self._retries):
            try:
                data = yf.download(tickers, period=period, auto_adjust=True)
                if not data.empty:
                    # yfinance 1.x повертає MultiIndex колонки для кількох тикерів
                    close = data["Close"] if "Close" in data.columns else data
                    result = close.dropna(how="all")
                    self._cache[cache_key] = result
                    return result
            except Exception as e:
                print(f"⚠️  Спроба {attempt + 1}/{self._retries} для {tickers}: {e}")
            delay = self._retry_delay * (2 ** attempt)
            print(f"⏳ Чекаємо {delay:.0f}с...")
            time.sleep(delay)
            
        print(f"🔄 Генеруємо MOCK-дані для портфеля {tickers} через Rate Limit...")
        import numpy as np
        dates = pd.date_range(end=pd.Timestamp.today().normalize(), periods=252 * 5, freq='B')
        mock_data = {}
        for t in tickers:
            np.random.seed(hash(t) % (2**32))
            returns = np.random.normal(0.0005, 0.02, len(dates))
            mock_data[t] = 100 * np.exp(np.cumsum(returns))
        
        df = pd.DataFrame(mock_data, index=dates)
        self._cache[cache_key] = df
        return df

    def fetch_info(self, ticker: str) -> dict:
        """
        Повертає метаінформацію про актив (P/E, market cap, beta тощо).
        При помилці повертає порожній словник, щоб не ламати симуляцію.
        """
        cache_key = f"info_{ticker}"
        if cache_key in self._cache:
            print(f"📦 Кеш: info {ticker}")
            return self._cache[cache_key]

        try:
            result = yf.Ticker(ticker).info or {}
            self._cache[cache_key] = result
            return result
        except Exception as e:
            print(f"⚠️  Не вдалося отримати info для {ticker}: {e}")
            return {}

    def fetch_news(self, ticker: str, limit: int = 5) -> list[dict]:
        """
        Повертає список новин для тикера.

        Увага: yfinance 1.x змінив структуру новин — тепер кожен елемент
        має вигляд {'id': ..., 'content': {...}}, де у 'content' лежать
        title, provider, canonicalUrl, pubDate. Обробляємо обидва формати.
        """
        cache_key = f"news_{ticker}"
        if cache_key in self._cache:
            print(f"📦 Кеш: news {ticker}")
            return self._cache[cache_key]

        try:
            raw_news = yf.Ticker(ticker).news or []
            result = []
            for n in raw_news:
                content = n.get("content") or {}
                title = (
                    content.get("title")
                    or content.get("summary")
                    or n.get("title")
                    or n.get("headline")
                    or ""
                )
                if not title:
                    continue

                provider = content.get("provider") or {}
                publisher = (
                    provider.get("displayName")
                    or provider.get("longName")
                    or n.get("publisher")
                    or n.get("source")
                    or "Yahoo Finance"
                )

                canonical = content.get("canonicalUrl") or {}
                link = (
                    canonical.get("url")
                    or content.get("clickThroughUrl")
                    or n.get("link")
                    or n.get("url")
                    or "#"
                )

                pub_date = content.get("pubDate") or n.get("providerPublishTime") or 0
                timestamp = self._parse_timestamp(pub_date)

                result.append({
                    "title": title,
                    "publisher": publisher,
                    "link": link,
                    "timestamp": timestamp,
                })
                if len(result) >= limit:
                    break
            self._cache[cache_key] = result
            return result
        except Exception as e:
            print(f"⚠️  Не вдалося отримати новини для {ticker}: {e}")
            return []

    def fetch_market_overview(self, tickers: list[str]) -> list[dict]:
        """
        Повертає поточні ціни та добову зміну для списку тикерів.
        Використовується для Market Overview на головній сторінці.
        """
        cache_key = f"overview_{'_'.join(sorted(tickers))}"
        if cache_key in self._cache:
            print(f"📦 Кеш: market overview")
            return self._cache[cache_key]

        try:
            data = yf.download(tickers, period="5d", auto_adjust=True)["Close"]
            result = []
            for t in tickers:
                series = data[t].dropna() if t in data.columns else pd.Series()
                if len(series) >= 2:
                    current = float(series.iloc[-1])
                    prev = float(series.iloc[-2])
                    change_pct = ((current - prev) / prev) * 100
                    result.append({
                        "ticker": t,
                        "price": f"{current:,.2f}",
                        "change": f"{change_pct:+.2f}%",
                        "isUp": change_pct >= 0,
                    })
            self._cache[cache_key] = result
            return result
        except Exception as e:
            print(f"⚠️  Market overview помилка: {e}")
            return []

    # ------------------------------------------------------------------
    # Приватні допоміжні методи
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_timestamp(value) -> int:
        """Конвертує pubDate (ISO-рядок або epoch-секунди) у epoch-секунди."""
        if isinstance(value, (int, float)):
            return int(value)
        if isinstance(value, str):
            try:
                iso = value.replace("Z", "+00:00")
                return int(datetime.fromisoformat(iso).timestamp())
            except Exception:
                return 0
        return 0

import time
import yfinance as yf
import pandas as pd


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
        raise ValueError(f"Не вдалося завантажити дані для {ticker} за {self._retries} спроб")

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
                    close = data["Close"] if "Close" in data.columns else data
                    result = close.dropna(how="all")
                    self._cache[cache_key] = result
                    return result
            except Exception as e:
                print(f"⚠️  Спроба {attempt + 1}/{self._retries} для {tickers}: {e}")
            delay = self._retry_delay * (2 ** attempt)
            print(f"⏳ Чекаємо {delay:.0f}с...")
            time.sleep(delay)
        raise ValueError(f"Не вдалося завантажити дані для {tickers}")

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
        """
        cache_key = f"news_{ticker}"
        if cache_key in self._cache:
            print(f"📦 Кеш: news {ticker}")
            return self._cache[cache_key]

        try:
            raw_news = yf.Ticker(ticker).news or []
            result = []
            for n in raw_news:
                title = n.get("title") or n.get("headline") or ""
                if not title:
                    continue
                result.append({
                    "title": title,
                    "publisher": n.get("publisher") or n.get("source") or "Yahoo Finance",
                    "link": n.get("link") or n.get("url") or "#",
                    "timestamp": n.get("providerPublishTime") or n.get("pubDate") or 0,
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
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

    def __init__(self, retries: int = 3, retry_delay: float = 1.0):
        self._retries = retries
        self._retry_delay = retry_delay

    # ------------------------------------------------------------------
    # Публічні методи
    # ------------------------------------------------------------------

    def fetch_history(self, ticker: str, period: str) -> pd.DataFrame:
        """
        Повертає повний OHLCV DataFrame для одного тикера.
        Колонки: Open, High, Low, Close, Volume
        """
        for attempt in range(self._retries):
            try:
                df = yf.Ticker(ticker).history(period=period)
                if not df.empty:
                    return df
            except Exception as e:
                print(f"⚠️  Спроба {attempt + 1}/{self._retries} для {ticker}: {e}")
            time.sleep(self._retry_delay)
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
        for attempt in range(self._retries):
            try:
                data = yf.download(tickers, period=period, auto_adjust=True)
                if not data.empty:
                    close = data["Close"] if "Close" in data.columns else data
                    return close.dropna(how="all")
            except Exception as e:
                print(f"⚠️  Спроба {attempt + 1}/{self._retries} для {tickers}: {e}")
            time.sleep(self._retry_delay)
        raise ValueError(f"Не вдалося завантажити дані для {tickers}")

    def fetch_info(self, ticker: str) -> dict:
        """
        Повертає метаінформацію про актив (P/E, market cap, beta тощо).
        При помилці повертає порожній словник, щоб не ламати симуляцію.
        """
        try:
            return yf.Ticker(ticker).info or {}
        except Exception as e:
            print(f"⚠️  Не вдалося отримати info для {ticker}: {e}")
            return {}

    def fetch_news(self, ticker: str, limit: int = 5) -> list[dict]:
        """
        Повертає список новин для тикера.
        """
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
            return result
        except Exception as e:
            print(f"⚠️  Не вдалося отримати новини для {ticker}: {e}")
            return []

    def fetch_market_overview(self, tickers: list[str]) -> list[dict]:
        """
        Повертає поточні ціни та добову зміну для списку тикерів.
        Використовується для Market Overview на головній сторінці.
        """
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
            return result
        except Exception as e:
            print(f"⚠️  Market overview помилка: {e}")
            return []
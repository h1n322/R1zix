from utils.logger import logger
import time
import json
import io
import requests
from datetime import datetime

import httpx
import redis
import pandas as pd
import numpy as np
import yfinance as yf

# Налаштування Redis. Використовуємо ім'я контейнера "redis" з docker-compose
redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

# Підміняємо User-Agent для прямих запитів, щоб обійти базовий захист Yahoo
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

class YFinanceProvider:
    """
    Data Gateway для фінансових даних.
    Використовує Redis для кешування (15 хвилин) та httpx для прямих запитів,
    щоб уникнути Rate Limit від Yahoo Finance.
    """

    def __init__(self, retries: int = 3, retry_delay: float = 2.0):
        self._retries = retries
        self._retry_delay = retry_delay
        self._cache_ttl = 900  # Кеш живе 15 хвилин (900 секунд)

    # ------------------------------------------------------------------
    # Публічні методи
    # ------------------------------------------------------------------

    def fetch_history(self, ticker: str, period: str = "5y") -> pd.DataFrame:
        """Повертає історію цін, використовуючи прямий запит до Yahoo (з кешем)."""
        cache_key = f"hist_{ticker}_{period}"
        
        try:
            cached = redis_client.get(cache_key)
            if cached:
                df = pd.read_json(io.StringIO(cached), orient="split")
                df.attrs['is_mock'] = False
                return df
        except Exception:
            pass

        for attempt in range(self._retries):
            try:
                # Мапимо period для Yahoo (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
                url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?range={period}&interval=1d"
                with httpx.Client() as client:
                    resp = client.get(url, headers={"User-Agent": USER_AGENT}, timeout=10.0)
                    if resp.status_code == 200:
                        data = resp.json()["chart"]["result"][0]
                        timestamps = data.get("timestamp", [])
                        quote = data["indicators"]["quote"][0]
                        df = pd.DataFrame({
                            "Open": quote.get("open", []),
                            "High": quote.get("high", []),
                            "Low": quote.get("low", []),
                            "Close": quote.get("close", []),
                            "Volume": quote.get("volume", [])
                        }, index=pd.to_datetime(timestamps, unit='s'))
                        
                        df.index = df.index.tz_localize(None)
                        df = df.dropna()
                        
                        if not df.empty:
                            try:
                                redis_client.setex(cache_key, self._cache_ttl, df.to_json(orient="split", date_format="iso"))
                            except: pass
                            df.attrs['is_mock'] = False
                            return df
            except Exception as e:
                logger.error(f"⚠️ Спроба {attempt+1}/{self._retries} history (Yahoo): {e}")
            time.sleep(self._retry_delay)
            
        logger.info(f"🔄 Пробуємо резервне джерело AlphaVantage для {ticker}...")
        df = self._fetch_history_alphavantage(ticker, period)
        if df is not None and not df.empty:
            df.attrs['is_mock'] = False
            return df
            
        logger.info(f"🔄 Генеруємо MOCK-дані для {ticker} через Rate Limit...")
        return self._generate_mock_history(ticker)

    def fetch_close(self, ticker: str, period: str) -> pd.Series:
        df = self.fetch_history(ticker, period)
        s = df["Close"].squeeze()
        s.attrs['is_mock'] = df.attrs.get('is_mock', False)
        return s

    def fetch_multi_close(self, tickers: list[str], period: str) -> pd.DataFrame:
        """Повертає DataFrame з цінами закриття для кількох тикерів."""
        tickers_str = '_'.join(sorted(tickers))
        cache_key = f"multi_{tickers_str}_{period}"
        
        try:
            cached = redis_client.get(cache_key)
            if cached:
                logger.info(f"📦 Redis Кеш: multi_close {tickers}")
                df = pd.read_json(cached, orient="split")
                df.attrs['is_mock'] = False
                return df
        except Exception as e:
            logger.error(f"⚠️ Помилка Redis (читання multi_close): {e}")

        # Збираємо дані по кожному тикеру окремо через наш fetch_close (який вже кешується)
        # Це надійніше, ніж yf.download, який часто падає на групі тикерів
        is_mock_any = False
        result_dict = {}
        for t in tickers:
            try:
                s = self.fetch_close(t, period)
                result_dict[t] = s
                if s.attrs.get('is_mock', False):
                    is_mock_any = True
            except Exception as e:
                logger.error(f"⚠️ Не вдалося завантажити {t} для multi_close: {e}")
            
        if result_dict:
            df = pd.DataFrame(result_dict)
            try:
                redis_client.setex(cache_key, self._cache_ttl, df.to_json(orient="split", date_format="iso"))
            except Exception as e:
                pass
            df.attrs['is_mock'] = is_mock_any
            return df

        logger.info(f"🔄 Генеруємо MOCK-дані для портфеля {tickers}...")
        return self._generate_mock_multi(tickers)

    def fetch_info(self, ticker: str) -> dict:
        """Повертає метаінформацію про актив через прямий запит до Yahoo."""
        cache_key = f"info_{ticker}"
        
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass

        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?range=1d&interval=1d"
            with httpx.Client() as client:
                resp = client.get(url, headers={"User-Agent": USER_AGENT}, timeout=10.0)
                if resp.status_code == 200:
                    meta = resp.json()["chart"]["result"][0]["meta"]
                    info = {
                        "regularMarketPrice": meta.get("regularMarketPrice"),
                        "previousClose": meta.get("chartPreviousClose", meta.get("previousClose")),
                        "shortName": meta.get("shortName", ticker)
                    }
                    try:
                        redis_client.setex(cache_key, self._cache_ttl, json.dumps(info))
                    except: pass
                    return info
        except Exception as e:
            logger.error(f"⚠️ Не вдалося отримати info для {ticker}: {e}")
        
        return {}

    def fetch_news(self, ticker: str, limit: int = 5) -> list[dict]:
        """Повертає новини через прямий пошуковий API Yahoo."""
        cache_key = f"news_{ticker}"
        try:
            cached = redis_client.get(cache_key)
            if cached:
                logger.info(f"📦 Redis Кеш: news {ticker}")
                return json.loads(cached)
        except Exception:
            pass

        try:
            url = f"https://query1.finance.yahoo.com/v1/finance/search?q={ticker}&newsCount={limit}"
            try:
                from curl_cffi import requests as cffi_requests
                resp = cffi_requests.get(url, impersonate="chrome", timeout=10.0)
            except ImportError:
                with httpx.Client() as client:
                    resp = client.get(url, headers={"User-Agent": USER_AGENT}, timeout=10.0)
                    
            if resp.status_code == 200:
                    news_data = resp.json().get("news", [])
                    result = []
                    for n in news_data:
                        result.append({
                            "title": n.get("title", ""),
                            "publisher": n.get("publisher", "Yahoo Finance"),
                            "link": n.get("link", "#"),
                            "timestamp": int(n.get("providerPublishTime", 0))
                        })
                    try:
                        redis_client.setex(cache_key, self._cache_ttl, json.dumps(result))
                    except Exception:
                        pass
                    return result
        except Exception as e:
            logger.error(f"⚠️ Не вдалося отримати HTTP новини для {ticker}: {e}")
        
        return []

    def fetch_market_overview(self, tickers: list[str]) -> list[dict]:
        """Повертає поточні ціни та добову зміну для списку тикерів."""
        tickers_str = '_'.join(sorted(tickers))
        cache_key = f"overview_{tickers_str}"
        
        try:
            cached = redis_client.get(cache_key)
            if cached:
                logger.info(f"📦 Redis Кеш: market overview")
                return json.loads(cached)
        except Exception:
            pass

        result = []
        for t in tickers:
            info = self.fetch_info(t)
            if info and info.get("regularMarketPrice"):
                current = float(info["regularMarketPrice"])
                prev = float(info.get("previousClose") or current)
                change_pct = ((current - prev) / prev) * 100 if prev else 0
                result.append({
                    "ticker": t,
                    "price": f"{current:,.2f}",
                    "change": f"{change_pct:+.2f}%",
                    "isUp": change_pct >= 0,
                })
        
        if result:
            try:
                redis_client.setex(cache_key, self._cache_ttl, json.dumps(result))
            except Exception:
                pass
            
        return result

    # ------------------------------------------------------------------
    # Приватні допоміжні методи
    # ------------------------------------------------------------------

    def _fetch_history_alphavantage(self, ticker: str, period: str) -> pd.DataFrame:
        import os
        api_key = os.getenv("ALPHAVANTAGE_API_KEY", "demo")
        # clean crypto tickers
        av_ticker = ticker.replace("-USD", "")
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={av_ticker}&outputsize=full&apikey={api_key}"
        try:
            with httpx.Client() as client:
                resp = client.get(url, timeout=5.0)
                if resp.status_code == 200:
                    data = resp.json()
                    ts = data.get("Time Series (Daily)")
                    if ts:
                        df = pd.DataFrame.from_dict(ts, orient="index")
                        df.index = pd.to_datetime(df.index)
                        df = df.rename(columns={
                            "1. open": "Open",
                            "2. high": "High",
                            "3. low": "Low",
                            "4. close": "Close",
                            "5. volume": "Volume"
                        })
                        df = df.astype(float)
                        df = df.sort_index()
                        
                        # filter by period approximately
                        if period.endswith('y'):
                            years = int(period[:-1])
                            cutoff = pd.Timestamp.today() - pd.DateOffset(years=years)
                            df = df[df.index >= cutoff]
                        return df
        except Exception as e:
            logger.error(f"⚠️ AlphaVantage помилка: {e}")
        return None

    def _generate_mock_history(self, ticker: str) -> pd.DataFrame:
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
        df.attrs['is_mock'] = True
        return df

    def _generate_mock_multi(self, tickers: list[str]) -> pd.DataFrame:
        dates = pd.date_range(end=pd.Timestamp.today().normalize(), periods=252 * 5, freq='B')
        mock_data = {}
        for t in tickers:
            np.random.seed(hash(t) % (2**32))
            returns = np.random.normal(0.0005, 0.02, len(dates))
            mock_data[t] = 100 * np.exp(np.cumsum(returns))
        df = pd.DataFrame(mock_data, index=dates)
        df.attrs['is_mock'] = True
        return df

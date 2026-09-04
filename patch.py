import re

with open("riskmate-ai-service/infrastructure/data_provider.py", "r") as f:
    content = f.read()

def fetch_history_new():
    return """    def fetch_history(self, ticker: str, period: str = "5y") -> pd.DataFrame:
        \"\"\"Повертає історію цін, використовуючи прямий запит до Yahoo (з кешем).\"\"\"
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
                print(f"⚠️ Спроба {attempt+1}/{self._retries} history (Yahoo): {e}")
            time.sleep(self._retry_delay)
            
        print(f"🔄 Пробуємо резервне джерело AlphaVantage для {ticker}...")
        df = self._fetch_history_alphavantage(ticker, period)
        if df is not None and not df.empty:
            df.attrs['is_mock'] = False
            return df
            
        print(f"🔄 Генеруємо MOCK-дані для {ticker} через Rate Limit...")
        return self._generate_mock_history(ticker)"""

def fetch_info_new():
    return """    def fetch_info(self, ticker: str) -> dict:
        \"\"\"Повертає метаінформацію про актив через прямий запит до Yahoo.\"\"\"
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
            print(f"⚠️ Не вдалося отримати info для {ticker}: {e}")
        
        return {}"""


import re
# Replace fetch_history
content = re.sub(
    r'    def fetch_history\(self, ticker: str, period: str = "5y"\) -> pd\.DataFrame:.*?return self\._generate_mock_history\(ticker\)', 
    fetch_history_new(), 
    content, 
    flags=re.DOTALL
)

# Replace fetch_info
content = re.sub(
    r'    def fetch_info\(self, ticker: str\) -> dict:.*?return \{\}', 
    fetch_info_new(), 
    content, 
    flags=re.DOTALL
)

# Replace fetch_news (query2 -> query1)
content = re.sub(
    r'https://query2\.finance\.yahoo\.com/v1/finance/search',
    'https://query1.finance.yahoo.com/v1/finance/search',
    content
)

with open("riskmate-ai-service/infrastructure/data_provider.py", "w") as f:
    f.write(content)

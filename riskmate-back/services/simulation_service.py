import time
import yfinance as yf
import numpy as np
import pandas as pd
from schemas.simulation_schemas import SimulationRequest

from services.monte_carlo import (
    run_backtest, run_garch, run_stress, 
    run_merton, run_historical, run_gbm
)

def download_yf_data(tickers, period="5y", retries=3):
    for _ in range(retries):
        try:
            data = yf.download(tickers, period=period)
            if not data.empty:
                return data
        except Exception:
            pass
        time.sleep(1)
    raise ValueError("Помилка завантаження даних від Yahoo Finance.")

def get_simulation_data(req: SimulationRequest):
    tickers = [t.strip().upper() for t in req.ticker.split(',')]
    
    main_ticker = tickers[0]
    ticker_obj = yf.Ticker(main_ticker)
    
    try:
        info = ticker_obj.info
    except Exception:
        info = {}

    asset_details = {
        "open": info.get("regularMarketOpen", None) or info.get("open", "N/A"),
        "high": info.get("dayHigh", "N/A"),
        "low": info.get("dayLow", "N/A"),
        "volume": info.get("volume", "N/A"),
        "marketCap": info.get("marketCap", "N/A"),
        "peRatio": info.get("trailingPE", "N/A"),
        "week52High": info.get("fiftyTwoWeekHigh", "N/A"),
        "week52Low": info.get("fiftyTwoWeekLow", "N/A"),
        "dividend": info.get("dividendYield", "N/A"),
        "beta": info.get("beta", "N/A")
    }

    try:
        raw_news = ticker_obj.news
        news_list = []
        for n in raw_news:
            title = n.get("title") or n.get("headline") or "Без заголовка"
            if title != "Без заголовка":
                news_list.append({
                    "title": title,
                    "publisher": n.get("publisher") or n.get("source") or "Yahoo Finance",
                    "link": n.get("link") or n.get("url") or "#",
                    "timestamp": n.get("providerPublishTime") or n.get("pubDate") or 0
                })
            if len(news_list) >= 5:
                break
    except Exception:
        news_list = []

    correlation_matrix = None
    
    # --- ДИНАМІЧНИЙ ПЕРІОД ---
    period_str = f"{req.lookback_years}y"

    # --- ДОДАНО ДЛЯ СВІЧОК: Зберігаємо повний датафрейм ---
    full_df = None 

    if len(tickers) == 1:
        # Беремо всі дані, а не тільки Close
        full_df = download_yf_data(tickers[0], period=period_str) 
        data = full_df['Close'].squeeze()
        returns = data.pct_change().dropna()
        mu = float(returns.mean())
        sigma = float(returns.std())
        last_price = float(data.iloc[-1])
    else:
        data_df = download_yf_data(tickers, period=period_str)['Close']
        returns_df = data_df.pct_change().dropna()
        correlation_matrix = returns_df.corr().round(2).to_dict()
        
        weights = np.array([1.0 / len(tickers)] * len(tickers))
        mu = float(returns_df.mean().dot(weights))
        cov_matrix = returns_df.cov()
        sigma = float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))))
        
        data = (data_df / data_df.iloc[0]).dot(weights) * 1000
        last_price = float(np.ravel(data.iloc[-1])[0])
        returns = data.pct_change().dropna() 

    actual_data = None
    garch_vol = None

    if req.algorithm == "backtest":
        f_p, s_p, actual_data = run_backtest(data, req.horizon, req.simulations)
    elif req.algorithm == "garch":
        f_p, s_p, garch_vol = run_garch(last_price, returns, req.horizon, req.simulations)
    elif req.algorithm == "stress":
        f_p, s_p = run_stress(last_price, mu, sigma, req.horizon, req.simulations, req.scenario)
    elif req.algorithm == "merton":
        f_p, s_p = run_merton(last_price, mu, sigma, req.horizon, req.simulations)
    elif req.algorithm == "historical":
        f_p, s_p = run_historical(last_price, returns, req.horizon, req.simulations)
    else:
        f_p, s_p = run_gbm(last_price, mu, sigma, req.horizon, req.simulations)

    f_p = np.array(f_p)
    chart_data = []
    display_hist = data 
    
    sma50 = display_hist.rolling(window=50).mean()
    sma20 = display_hist.rolling(window=20).mean()
    std20 = display_hist.rolling(window=20).std()
    bb_upper = sma20 + (std20 * 2)
    bb_lower = sma20 - (std20 * 2)
    
    # --- НАУКОВІ ІНДИКАТОРИ (БРОНЬОВАНИЙ PANDAS) ---
    rsi_vals, atr_vals = [], []
    open_vals, high_vals, low_vals, close_vals = [], [], [], []
    
    if len(tickers) == 1 and full_df is not None:
        try:
            # .squeeze() гарантує, що ми працюємо з одновимірним масивом (Series), а не з DataFrame
            close_s = full_df['Close'].squeeze()
            high_s = full_df['High'].squeeze()
            low_s = full_df['Low'].squeeze()
            open_s = full_df['Open'].squeeze()

            delta = close_s.diff()
            gain = delta.clip(lower=0).ewm(alpha=1/14, adjust=False).mean()
            loss = (-delta.clip(upper=0)).ewm(alpha=1/14, adjust=False).mean()
            rs = gain / loss
            rsi_vals = (100 - (100 / (1 + rs))).fillna(0).tolist()

            high_low = high_s - low_s
            high_close = (high_s - close_s.shift()).abs()
            low_close = (low_s - close_s.shift()).abs()
            tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
            atr_vals = tr.ewm(alpha=1/14, adjust=False).mean().fillna(0).tolist()
            
            open_vals = open_s.tolist()
            high_vals = high_s.tolist()
            low_vals = low_s.tolist()
            close_vals = close_s.tolist()
        except Exception as e:
            print(f"🚨 Помилка індикаторів: {e}")
    # -------------------------------------------------------------

    # Зверни увагу: ми використовуємо enumerate для 100% точного мапінгу даних
    for i, (d, p) in enumerate(display_hist.items()):
        point = {
            "name": pd.to_datetime(d).strftime("%Y-%m-%d"), 
            "history": round(float(p), 2)
        }
        
        # --- ПАКУВАННЯ БЕЗ ПОМИЛОК ІНДЕКСІВ ---
        if len(tickers) == 1 and full_df is not None and len(rsi_vals) > i:
            try:
                point["open"] = round(float(open_vals[i]), 2)
                point["high"] = round(float(high_vals[i]), 2)
                point["low"] = round(float(low_vals[i]), 2)
                point["close"] = round(float(close_vals[i]), 2)
                
                if rsi_vals[i] != 0:
                    point["rsi"] = round(float(rsi_vals[i]), 2)
                if atr_vals[i] != 0:
                    point["atr"] = round(float(atr_vals[i]), 2)
            except Exception:
                pass 
        # ---------------------------------------

        if not pd.isna(sma50.loc[d]):
            point["sma50"] = round(float(sma50.loc[d]), 2)
        if not pd.isna(bb_upper.loc[d]):
            point["bb_upper"] = round(float(bb_upper.loc[d]), 2)
            point["bb_lower"] = round(float(bb_lower.loc[d]), 2)
        chart_data.append(point)

    if len(chart_data) > 0:
        last_val = chart_data[-1]["history"]
        chart_data[-1]["forecast"] = last_val
        if actual_data is not None:
            chart_data[-1]["actual"] = last_val

    last_date = pd.to_datetime(display_hist.index[-1])
    future_dates = pd.bdate_range(start=last_date + pd.Timedelta(days=1), periods=req.horizon)

    for i in range(1, req.horizon + 1):
        date_str = future_dates[i - 1].strftime("%Y-%m-%d")
        point = {"name": date_str}
        avg_f = np.mean([path[i] for path in s_p])
        point["forecast"] = round(float(avg_f), 2)
        if actual_data is not None and i - 1 < len(actual_data):
            point["actual"] = round(float(actual_data.iloc[i - 1]), 2)
        chart_data.append(point)

    volatility_val = garch_vol if req.algorithm == "garch" else sigma * np.sqrt(252)
    expected_return_pct = ((np.mean(f_p) - last_price) / last_price) * 100
    best_case = np.percentile(f_p, 95)
    roll_max = data.cummax()
    historical_dd = ((data - roll_max) / roll_max).min() * 100
    
    alpha_percentile = (1.0 - req.var_confidence) * 100
    annual_return = mu * 252
    sharpe = (annual_return - req.risk_free_rate) / volatility_val if volatility_val > 0 else 0

    counts, bin_edges = np.histogram(f_p, bins=40)
    histogram_data = []
    for i in range(len(counts)):
        mid_price = round(float((bin_edges[i] + bin_edges[i+1]) / 2), 2)
        histogram_data.append({"price": mid_price, "count": int(counts[i])})

    return {
        "expected_price": round(float(np.mean(f_p)), 2),
        "var_5": round(float(last_price - np.percentile(f_p, alpha_percentile)), 2),
        "cvar_5": round(float(last_price - np.mean(f_p[f_p < np.percentile(f_p, alpha_percentile)])), 2),
        "volatility": round(float(volatility_val * 100), 2),
        "return_pct": round(float(expected_return_pct), 2),
        "best_case": round(float(best_case), 2),
        "max_drawdown": round(float(historical_dd), 2),
        "sharpe_ratio": round(float(sharpe), 2),
        "chart_data": chart_data,
        "assetDetails": asset_details,
        "news": news_list,                     
        "correlation_matrix": correlation_matrix,
        "histogram": histogram_data  
    }
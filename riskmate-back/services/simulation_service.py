"""
SimulationService — оркеструє весь процес симуляції.

Отримує:
  - domain.Simulation (параметри що і як симулювати)
  - YFinanceProvider   (звідки брати дані)

Повертає:
  - dict з результатами для фронтенду
"""
import numpy as np
import pandas as pd

from domain.entities import Simulation
from infrastructure.data_provider import YFinanceProvider

from .monte_carlo import (
    run_gbm,
    run_garch,
    run_historical,
    run_merton,
    run_stress,
    run_backtest,
)


class SimulationService:
    def __init__(self, provider: YFinanceProvider):
        self._provider = provider

    # ------------------------------------------------------------------
    # Головний публічний метод
    # ------------------------------------------------------------------

    def run(self, simulation: Simulation) -> dict:
        simulation.validate()

        tickers = [t.strip().upper() for t in simulation.ticker.split(",")]
        main_ticker = tickers[0]
        period_str = f"{simulation.lookback_years}y"

        # ---------- Завантаження даних ----------
        asset_details = self._provider.fetch_info(main_ticker)
        news_list = self._provider.fetch_news(main_ticker)

        full_df = None
        correlation_matrix = None

        if len(tickers) == 1:
            full_df = self._provider.fetch_history(main_ticker, period_str)
            data = full_df["Close"].squeeze()
            returns = data.pct_change().dropna()
            mu = float(returns.mean())
            sigma = float(returns.std())
            last_price = float(data.iloc[-1])
        else:
            close_df = self._provider.fetch_multi_close(tickers, period_str)
            returns_df = close_df.pct_change().dropna()
            correlation_matrix = returns_df.corr().round(2).to_dict()

            weights = np.array([1.0 / len(tickers)] * len(tickers))
            mu = float(returns_df.mean().dot(weights))
            cov_matrix = returns_df.cov()
            sigma = float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))))

            data = (close_df / close_df.iloc[0]).dot(weights) * 1000
            last_price = float(np.ravel(data.iloc[-1])[0])
            returns = data.pct_change().dropna()

        # ---------- Запуск алгоритму ----------
        actual_data = None
        garch_vol = None

        algo = simulation.algorithm
        h = simulation.horizon
        s = simulation.simulations

        if algo == "backtest":
            f_p, s_p, actual_data = run_backtest(data, h, s)
        elif algo == "garch":
            f_p, s_p, garch_vol = run_garch(last_price, returns, h, s)
        elif algo == "stress":
            f_p, s_p = run_stress(last_price, mu, sigma, h, s, simulation.scenario)
        elif algo == "merton":
            f_p, s_p = run_merton(last_price, mu, sigma, h, s)
        elif algo == "historical":
            f_p, s_p = run_historical(last_price, returns, h, s)
        else:
            f_p, s_p = run_gbm(last_price, mu, sigma, h, s)

        f_p = np.array(f_p)

        # ---------- Технічні індикатори ----------
        chart_data = self._build_chart_data(
            data, full_df, tickers, s_p, actual_data, simulation.horizon
        )

        # ---------- Фінальні метрики ----------
        volatility_val = garch_vol if algo == "garch" else sigma * np.sqrt(252)
        alpha_pct = (1.0 - simulation.var_confidence) * 100
        annual_return = mu * 252
        sharpe = (annual_return - simulation.risk_free_rate) / volatility_val if volatility_val > 0 else 0

        counts, bin_edges = np.histogram(f_p, bins=40)
        max_count = max(counts) if len(counts) > 0 else 1
        histogram_data = [
            {
                "h": round((counts[i] / max_count) * 100, 2),
                "type": "red" if (bin_edges[i] + bin_edges[i + 1]) / 2 < last_price else "green",
                "price": round(float((bin_edges[i] + bin_edges[i + 1]) / 2), 2),
            }
            for i in range(len(counts))
        ]

        roll_max = data.cummax()
        historical_dd = float(((data - roll_max) / roll_max).min() * 100)

        return {
            "expected_price": round(float(np.mean(f_p)), 2),
            "var_5": round(float(last_price - np.percentile(f_p, alpha_pct)), 2),
            "cvar_5": round(
                float(last_price - np.mean(f_p[f_p < np.percentile(f_p, alpha_pct)])), 2
            ),
            "volatility": round(float(volatility_val * 100), 2),
            "return_pct": round(float(((np.mean(f_p) - last_price) / last_price) * 100), 2),
            "best_case": round(float(np.percentile(f_p, 95)), 2),
            "max_drawdown": round(historical_dd, 2),
            "sharpe_ratio": round(float(sharpe), 2),
            "chart_data": chart_data,
            "stock_info": self._build_stock_info(asset_details),
            "news": news_list,
            "correlation_matrix": correlation_matrix,
            "histogram": histogram_data,
        }

    # ------------------------------------------------------------------
    # Приватні допоміжні методи
    # ------------------------------------------------------------------

    def _build_chart_data(
        self,
        data: pd.Series,
        full_df,
        tickers: list[str],
        s_p: list,
        actual_data,
        horizon: int,
    ) -> list[dict]:
        """Будує масив точок для графіка: historical + forecast."""

        sma50 = data.rolling(window=50).mean()
        sma20 = data.rolling(window=20).mean()
        std20 = data.rolling(window=20).std()
        bb_upper = sma20 + std20 * 2
        bb_lower = sma20 - std20 * 2

        # Технічні індикатори (тільки для одного тикера)
        rsi_vals, atr_vals = [], []
        open_vals, high_vals, low_vals, close_vals = [], [], [], []

        if len(tickers) == 1 and full_df is not None:
            try:
                close_s = full_df["Close"].squeeze()
                high_s = full_df["High"].squeeze()
                low_s = full_df["Low"].squeeze()
                open_s = full_df["Open"].squeeze()

                delta = close_s.diff()
                gain = delta.clip(lower=0).ewm(alpha=1 / 14, adjust=False).mean()
                loss = (-delta.clip(upper=0)).ewm(alpha=1 / 14, adjust=False).mean()
                rsi_vals = (100 - (100 / (1 + gain / loss))).fillna(0).tolist()

                hl = high_s - low_s
                hc = (high_s - close_s.shift()).abs()
                lc = (low_s - close_s.shift()).abs()
                tr = pd.concat([hl, hc, lc], axis=1).max(axis=1)
                atr_vals = tr.ewm(alpha=1 / 14, adjust=False).mean().fillna(0).tolist()

                open_vals = open_s.tolist()
                high_vals = high_s.tolist()
                low_vals = low_s.tolist()
                close_vals = close_s.tolist()
            except Exception as e:
                print(f"⚠️  Помилка індикаторів: {e}")

        chart_data = []
        for i, (d, p) in enumerate(data.items()):
            point: dict = {
                "name": pd.to_datetime(d).strftime("%Y-%m-%d"),
                "history": round(float(p), 2),
            }

            if len(tickers) == 1 and full_df is not None and i < len(rsi_vals):
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

            sma50_val = sma50.iloc[i] if i < len(sma50) else float("nan")
            bb_u_val = bb_upper.iloc[i] if i < len(bb_upper) else float("nan")
            bb_l_val = bb_lower.iloc[i] if i < len(bb_lower) else float("nan")

            if not pd.isna(sma50_val):
                point["sma50"] = round(float(sma50_val), 2)
            if not pd.isna(bb_u_val):
                point["bb_upper"] = round(float(bb_u_val), 2)
                point["bb_lower"] = round(float(bb_l_val), 2)

            chart_data.append(point)

        # Остання historical-точка = початок forecast
        if chart_data:
            last_val = chart_data[-1]["history"]
            chart_data[-1]["forecast"] = last_val
            if actual_data is not None:
                chart_data[-1]["actual"] = last_val

        # Майбутні дати
        last_date = pd.to_datetime(data.index[-1])
        future_dates = pd.bdate_range(
            start=last_date + pd.Timedelta(days=1), periods=horizon
        )

        for i in range(1, horizon + 1):
            date_str = future_dates[i - 1].strftime("%Y-%m-%d")
            avg_f = float(np.mean([path[i] for path in s_p]))
            point = {"name": date_str, "forecast": round(avg_f, 2)}
            if actual_data is not None and i - 1 < len(actual_data):
                point["actual"] = round(float(actual_data.iloc[i - 1]), 2)
            chart_data.append(point)

        return chart_data

    @staticmethod
    def _format_val(val, prefix: str = "", is_large_number: bool = False) -> str:
        if val in ("N/A", None):
            return "N/A"
        try:
            num = float(val)
            if is_large_number:
                if num >= 1e12:
                    return f"{prefix}{num / 1e12:.2f} трлн"
                if num >= 1e9:
                    return f"{prefix}{num / 1e9:.2f} млрд"
                if num >= 1e6:
                    return f"{prefix}{num / 1e6:.2f} млн"
            return f"{prefix}{num:.2f}"
        except Exception:
            return str(val)

    def _build_stock_info(self, info: dict) -> list[dict]:
        fv = self._format_val
        return [
            {"label": "Відкриття",    "value": fv(info.get("regularMarketOpen") or info.get("open"), prefix="$")},
            {"label": "Обсяг",        "value": fv(info.get("volume"), is_large_number=True)},
            {"label": "52-тиж. макс.","value": fv(info.get("fiftyTwoWeekHigh"), prefix="$")},
            {"label": "Бета-фактор",  "value": fv(info.get("beta"))},
            {"label": "52-тиж. мін.", "value": fv(info.get("fiftyTwoWeekLow"), prefix="$")},
            {"label": "Р/Е (Ц/П)",   "value": fv(info.get("trailingPE"))},
        ]
from utils.logger import logger
"""
PortfolioService — оптимізація портфеля за теорією Марковіца.

Максимізує коефіцієнт Шарпа через мінімізацію його від'ємного значення
(scipy.optimize.minimize вміє тільки мінімізувати).
"""
import numpy as np
import pandas as pd
from scipy.optimize import minimize

from domain.entities import Portfolio
from infrastructure.data_provider import YFinanceProvider


class PortfolioService:
    def __init__(self, provider: YFinanceProvider):
        self._provider = provider

    def optimize(self, portfolio: Portfolio) -> dict:
        """
        Знаходить оптимальні частки активів у портфелі.
        Повертає:
          - allocations: {TICKER: відсоток}
          - expected_annual_return
          - annual_volatility
          - sharpe_ratio
          - correlation_matrix
        """
        portfolio.validate()

        # 1. Завантажуємо ціни закриття для всіх тикерів
        price_data = {}
        for t in portfolio.tickers:
            try:
                series = self._provider.fetch_close(t, period="5y")
                if not series.empty:
                    price_data[t] = series
            except Exception as e:
                logger.error(f"⚠️  Пропускаємо {t}: {e}")

        data = pd.DataFrame(price_data).dropna()

        if data.empty or len(data.columns) < 2:
            return {"error": "Недостатньо даних або менше двох дійсних активів."}

        valid_tickers = list(data.columns)
        num_assets = len(valid_tickers)

        # 2. Щоденні дохідності
        returns = data.pct_change().dropna()
        mean_returns = returns.mean() * 252          # річна дохідність
        cov_matrix = returns.cov() * 252             # річна ковариація

        # 3. Функції розрахунку метрик
        def portfolio_stats(weights):
            p_ret = float(np.sum(mean_returns * weights))
            p_vol = float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))))
            return p_ret, p_vol

        def neg_sharpe_ratio(weights):
            p_ret, p_vol = portfolio_stats(weights)
            if p_vol == 0:
                return 0.0
            return -(p_ret - portfolio.risk_free_rate) / p_vol

        # 4. Умови оптимізатора
        constraints = ({"type": "eq", "fun": lambda x: np.sum(x) - 1},)
        bounds = tuple((0, 1) for _ in range(num_assets))
        init_guess = [1.0 / num_assets] * num_assets

        # 5. Запускаємо SLSQP оптимізатор
        result = minimize(
            neg_sharpe_ratio,
            init_guess,
            method="SLSQP",
            bounds=bounds,
            constraints=constraints,
        )

        if not result.success:
            return {"error": "Оптимізатору не вдалося знайти рішення. Спробуйте інші тикери."}

        # 6. Збираємо результати
        opt_weights = result.x
        opt_ret, opt_vol = portfolio_stats(opt_weights)
        sharpe = (opt_ret - portfolio.risk_free_rate) / opt_vol if opt_vol > 0 else 0

        allocations = {
            valid_tickers[i]: round(float(opt_weights[i]) * 100, 2)
            for i in range(num_assets)
        }
        correlation_dict = returns.corr().round(2).to_dict()

        return {
            "allocations": allocations,
            "expected_annual_return": round(opt_ret * 100, 2),
            "annual_volatility": round(opt_vol * 100, 2),
            "sharpe_ratio": round(sharpe, 2),
            "correlation_matrix": correlation_dict,
        }

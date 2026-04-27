"""
Чисті функції симуляцій Монте-Карло.
Цей модуль не знає нічого про FastAPI, yfinance чи базу даних.
Він отримує готові числові дані і повертає результати.
"""
import numpy as np
import pandas as pd
from arch import arch_model


def run_gbm(
    current_price: float,
    mu: float,
    sigma: float,
    horizon: int,
    simulations: int,
    dt: float = 1,
) -> tuple[list[float], list[list[float]]]:
    """
    Geometric Brownian Motion — стандартна модель броунівського руху.
    Припускає постійну волатильність (sigma) і дохідність (mu).
    """
    final_prices, simulated_paths = [], []

    for i in range(simulations):
        shocks = np.random.normal(0, 1, horizon)
        path = [current_price]
        for t in range(horizon):
            next_p = path[-1] * np.exp(
                (mu - 0.5 * sigma ** 2) * dt + sigma * np.sqrt(dt) * shocks[t]
            )
            path.append(next_p)
        final_prices.append(path[-1])
        if i < 5:
            simulated_paths.append(path)

    return final_prices, simulated_paths


def run_garch(
    current_price: float,
    returns: pd.Series,
    horizon: int,
    simulations: int,
    dt: float = 1,
) -> tuple[list[float], list[list[float]], float]:
    """
    GARCH(1,1) — враховує кластеризацію волатильності.
    Реальна волатильність змінюється з часом залежно від попередніх шоків.
    """
    res = arch_model(returns * 100, vol="Garch", p=1, q=1).fit(disp="off")
    forecasts = res.forecast(horizon=horizon)
    var_forecast = forecasts.variance.values[-1, :] / 10000
    garch_vol = float(np.sqrt(np.mean(var_forecast)) * np.sqrt(252))

    mu = float(returns.mean())
    final_prices, simulated_paths = [], []

    for i in range(simulations):
        shocks = np.random.normal(0, 1, horizon)
        path = [current_price]
        for t in range(horizon):
            vol_t = float(np.sqrt(var_forecast[t]))
            next_p = path[-1] * np.exp(
                (mu - 0.5 * vol_t ** 2) * dt + vol_t * np.sqrt(dt) * shocks[t]
            )
            path.append(next_p)
        final_prices.append(path[-1])
        if i < 5:
            simulated_paths.append(path)

    return final_prices, simulated_paths, garch_vol


def run_historical(
    current_price: float,
    historical_returns: pd.Series,
    horizon: int,
    simulations: int,
) -> tuple[list[float], list[list[float]]]:
    """
    Historical Bootstrap — не робить припущень про розподіл.
    Просто бере реальні минулі прибутки і перемішує їх випадково.
    """
    final_prices, simulated_paths = [], []

    for i in range(simulations):
        sampled = np.random.choice(historical_returns, size=horizon, replace=True)
        path = [current_price]
        for r in sampled:
            path.append(path[-1] * (1 + r))
        final_prices.append(path[-1])
        if i < 5:
            simulated_paths.append(path)

    return final_prices, simulated_paths


def run_merton(
    current_price: float,
    mu: float,
    sigma: float,
    horizon: int,
    simulations: int,
    dt: float = 1,
) -> tuple[list[float], list[list[float]]]:
    """
    Merton Jump-Diffusion — додає рідкісні різкі стрибки (краші, новини).
    lam  = середня кількість стрибків на рік
    mu_j = середній розмір стрибка (від'ємний = переважно вниз)
    sigma_j = волатильність стрибка
    """
    lam = 5 / 252       # ~5 стрибків на рік, конвертовано в щоденний
    mu_j = -0.05        # в середньому -5% на стрибок
    sigma_j = 0.10      # розкид розміру стрибка

    final_prices, simulated_paths = [], []

    for i in range(simulations):
        shocks = np.random.normal(0, 1, horizon)
        poisson_jumps = np.random.poisson(lam * dt, horizon)
        jump_sizes = np.random.normal(mu_j, sigma_j, horizon) * poisson_jumps

        path = [current_price]
        for t in range(horizon):
            drift = mu - 0.5 * sigma ** 2
            diffusion = sigma * np.sqrt(dt) * shocks[t]
            next_p = path[-1] * np.exp(drift * dt + diffusion + jump_sizes[t])
            path.append(next_p)
        final_prices.append(path[-1])
        if i < 5:
            simulated_paths.append(path)

    return final_prices, simulated_paths


def run_stress(
    current_price: float,
    mu: float,
    sigma: float,
    horizon: int,
    simulations: int,
    scenario: str,
    dt: float = 1,
) -> tuple[list[float], list[list[float]]]:
    """
    Stress Test — GBM з миттєвим шоком на 5-й день.
    Імітує реальні кризові сценарії (COVID, фінансова криза тощо).
    """
    shock_map = {
        "covid": 0.70,           # -30%
        "financial_crisis": 0.50, # -50%
        "tech_bubble": 0.60,     # -40%
    }
    shock_multiplier = shock_map.get(scenario, 1.0)

    final_prices, simulated_paths = [], []

    for i in range(simulations):
        shocks = np.random.normal(0, 1, horizon)
        path = [current_price]
        for t in range(horizon):
            next_p = path[-1] * np.exp(
                (mu - 0.5 * sigma ** 2) * dt + sigma * np.sqrt(dt) * shocks[t]
            )
            if t == 5:
                next_p *= shock_multiplier
            path.append(next_p)
        final_prices.append(path[-1])
        if i < 5:
            simulated_paths.append(path)

    return final_prices, simulated_paths


def run_backtest(
    hist_prices: pd.Series,
    horizon: int,
    simulations: int,dt: float = 1,
) -> tuple[list[float], list[list[float]], pd.Series]:
    """
    Backtest — ділить历史 на train/test і порівнює прогноз з реальністю.
    Повертає actual_test_data для відображення на графіку.
    """
    train_data = hist_prices[:-horizon]
    actual_test_data = hist_prices[-horizon:]

    current_price = float(train_data.iloc[-1])
    returns = train_data.pct_change().dropna()
    mu = float(returns.mean())
    sigma = float(returns.std())

    final_prices, simulated_paths = [], []

    for i in range(simulations):
        shocks = np.random.normal(0, 1, horizon)
        path = [current_price]
        for t in range(horizon):
            next_p = path[-1] * np.exp(
                (mu - 0.5 * sigma ** 2) * dt + sigma * np.sqrt(dt) * shocks[t]
            )
            path.append(next_p)
        final_prices.append(path[-1])
        if i < 5:
            simulated_paths.append(path)

    return final_prices, simulated_paths, actual_test_data


dt = 1
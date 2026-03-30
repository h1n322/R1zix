import numpy as np
import pandas as pd
from arch import arch_model

def run_gbm(current_price, mu, sigma, horizon, simulations, dt=1):
    final_prices, simulated_paths = [], []
    for i in range(simulations):
        shocks = np.random.normal(0, 1, horizon)
        path = [current_price]
        for t in range(horizon):
            next_p = path[-1] * np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * shocks[t])
            path.append(next_p)
        final_prices.append(path[-1])
        if i < 5: simulated_paths.append(path)
    return final_prices, simulated_paths

def run_garch(current_price, returns, horizon, simulations, dt=1):
    res = arch_model(returns * 100, vol='Garch', p=1, q=1).fit(disp='off')
    forecasts = res.forecast(horizon=horizon)
    var_forecast = forecasts.variance.values[-1, :] / 10000
    garch_vol = np.sqrt(np.mean(var_forecast)) * np.sqrt(252)
    
    mu = returns.mean()
    final_prices, simulated_paths = [], []
    for i in range(simulations):
        shocks = np.random.normal(0, 1, horizon)
        path = [current_price]
        for t in range(horizon):
            vol_t = np.sqrt(var_forecast[t])
            next_p = path[-1] * np.exp((mu - 0.5 * vol_t**2) * dt + vol_t * np.sqrt(dt) * shocks[t])
            path.append(next_p)
        final_prices.append(path[-1])
        if i < 5: simulated_paths.append(path)
    return final_prices, simulated_paths, garch_vol

def run_historical(current_price, historical_returns, horizon, simulations):
    final_prices = []
    simulated_paths = []
    for i in range(simulations):
        sampled_returns = np.random.choice(historical_returns, size=horizon, replace=True)
        price_path = [current_price]
        for r in sampled_returns:
            price_path.append(price_path[-1] * (1 + r))
        final_prices.append(price_path[-1])
        if i < 5: simulated_paths.append(price_path)
    return final_prices, simulated_paths

def run_merton(current_price, mu, sigma, horizon, simulations, dt=1):
    final_prices = []
    simulated_paths = []
    lam = 5 / 252  
    mu_j = -0.05   
    sigma_j = 0.1  
    for i in range(simulations):
        shocks = np.random.normal(0, 1, horizon)
        poisson_jumps = np.random.poisson(lam * dt, horizon) 
        jump_sizes = np.random.normal(mu_j, sigma_j, horizon) * poisson_jumps
        
        price_path = [current_price]
        for t in range(horizon):
            drift = mu - 0.5 * sigma**2
            diffusion = sigma * np.sqrt(dt) * shocks[t]
            next_price = price_path[-1] * np.exp(drift * dt + diffusion + jump_sizes[t])
            price_path.append(next_price)
        final_prices.append(price_path[-1])
        if i < 5: simulated_paths.append(price_path)
    return final_prices, simulated_paths

def run_stress(current_price, mu, sigma, horizon, simulations, scenario, dt=1):
    final_prices = []
    simulated_paths = []
    shock_multiplier = 1.0
    if scenario == "covid": shock_multiplier = 0.70
    elif scenario == "financial_crisis": shock_multiplier = 0.50
    elif scenario == "tech_bubble": shock_multiplier = 0.60

    for i in range(simulations):
        shocks = np.random.normal(0, 1, horizon)
        price_path = [current_price]
        for t in range(horizon):
            next_price = price_path[-1] * np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * shocks[t])
            if t == 5: 
                next_price *= shock_multiplier
            price_path.append(next_price)
        final_prices.append(price_path[-1])
        if i < 5: simulated_paths.append(price_path)
    return final_prices, simulated_paths

def run_backtest(hist_prices, horizon, simulations):
    train_data = hist_prices[:-horizon]
    actual_test_data = hist_prices[-horizon:]
    
    current_price = train_data.iloc[-1]
    returns = train_data.pct_change().dropna()
    mu = returns.mean()
    sigma = returns.std()
    
    final_prices = []
    simulated_paths = []
    dt = 1
    
    for i in range(simulations):
        shocks = np.random.normal(0, 1, horizon)
        price_path = [current_price]
        for t in range(horizon):
            next_price = price_path[-1] * np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * shocks[t])
            price_path.append(next_price)
        final_prices.append(price_path[-1])
        if i < 5: simulated_paths.append(price_path)
            
    return final_prices, simulated_paths, actual_test_data

def run_lstm(current_price, hist_data, horizon, simulations, dt=1):
    returns = hist_data.pct_change().dropna()
    mu = returns.mean()
    sigma = returns.std()
    return run_gbm(current_price, mu, sigma, horizon, simulations, dt)
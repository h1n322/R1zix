import pandas as pd
import numpy as np
import yfinance as yf
from scipy.optimize import minimize

def optimize_markowitz(tickers, risk_free_rate=0.045):
    """
    Знаходить ідеальні частки активів у портфелі за теорією Марковіца
    (Максимізація коефіцієнта Шарпа).
    """
    print(f"📊 Запускаю оптимізацію Марковіца для: {tickers}")
    
    # 1. Завантажуємо історичні ціни для всіх тикерів
    price_data = {}
    for t in tickers:
        ticker_obj = yf.Ticker(t)
        df = ticker_obj.history(period="5y")
        if not df.empty:
            price_data[t] = df['Close']
            
    # Зводимо все в одну таблицю і видаляємо порожні дні
    data = pd.DataFrame(price_data).dropna()
    
    if data.empty or len(data.columns) < 2:
        return {"error": "Недостатньо даних або введено менше двох активів."}
        
    valid_tickers = list(data.columns)
    num_assets = len(valid_tickers)
    
    # 2. Рахуємо щоденні дохідності
    returns = data.pct_change().dropna()
    
    # Рахуємо середню річну дохідність (252 торгових дні у році)
    mean_returns = returns.mean() * 252
    
    # Рахуємо матрицю коваріацій (як активи рухаються один відносно одного)
    cov_matrix = returns.cov() * 252
    
    # 3. Функція для розрахунку метрик портфеля
    def portfolio_stats(weights):
        # Очікувана дохідність: сума (добуток ваг на середню дохідність)
        p_ret = np.sum(mean_returns * weights)
        # Волатильність (ризик): квадратний корінь з (W^T * Cov * W)
        p_vol = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
        return p_ret, p_vol

    # 4. Цільова функція (Те, що ми хочемо МІНІМІЗУВАТИ)
    # Ми мінімізуємо НЕГАТИВНИЙ коефіцієнт Шарпа, щоб знайти його максимум
    def neg_sharpe_ratio(weights):
        p_ret, p_vol = portfolio_stats(weights)
        return -(p_ret - risk_free_rate) / p_vol

    # 5. Налаштування умов для математичного вирішувача
    # Умова 1: Сума всіх ваг має дорівнювати 1 (100% капіталу)
    constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
    
    # Умова 2: Межі для кожної акції від 0.0 (0%) до 1.0 (100%). Жодних боргів (шортів).
    bounds = tuple((0, 1) for _ in range(num_assets))
    
    # Початкова здогадка (розподіляємо порівну, наприклад 33%, 33%, 33%)
    init_guess = num_assets * [1. / num_assets]
    
    # 6. МАГІЯ! Запускаємо оптимізатор (метод SLSQP)
    opt_results = minimize(neg_sharpe_ratio, init_guess, method='SLSQP', bounds=bounds, constraints=constraints)
    
    if not opt_results.success:
        return {"error": "Оптимізатору не вдалося знайти рішення."}
        
    # 7. Збираємо результати
    opt_weights = opt_results.x
    opt_ret, opt_vol = portfolio_stats(opt_weights)
    sharpe = (opt_ret - risk_free_rate) / opt_vol
    
    # Робимо красивий словник із відсотками
    allocations = {valid_tickers[i]: round(opt_weights[i] * 100, 2) for i in range(num_assets)}
    corr_matrix = returns.corr().round(2)
    correlation_dict = corr_matrix.to_dict() # <--- Повертаємо як було!
    
    return {
        "allocations": allocations,
        "expected_annual_return": round(opt_ret * 100, 2),
        "annual_volatility": round(opt_vol * 100, 2),
        "sharpe_ratio": round(sharpe, 2),
        "correlation_matrix": correlation_dict # <--- Відправляємо словник
    }

# Для швидкого тестування:
if __name__ == "__main__":
    test_tickers = ["AAPL", "KO", "MSFT"]
    res = optimize_markowitz(test_tickers)
    print("Результат оптимізації:")
    print(res)
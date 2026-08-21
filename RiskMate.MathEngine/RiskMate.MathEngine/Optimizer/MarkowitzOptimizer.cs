using System;
using System.Collections.Generic;
using System.Linq;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Calculators;

namespace RiskMate.MathEngine.Optimizers
{
    public class MarkowitzOptimizer
    {
        /// <summary>
        /// Знаходить оптимальні ваги активів для максимізації коефіцієнта Шарпа.
        /// </summary>
        /// <param name="assetReturns">Словник: Тікер -> Масив історичних логарифмічних дохідностей</param>
        /// <param name="riskFreeRate">Безризикова ставка (наприклад, 0.04 для 4%)</param>
        /// <param name="simulations">Кількість випадкових портфелів (рекомендовано 50000+)</param>
        public MarkowitzResult Optimize(Dictionary<string, List<double>> assetReturns, double riskFreeRate = 0.04, int simulations = 50000)
        {
            var tickers = assetReturns.Keys.ToList();
            int n = tickers.Count;

            // 1. Попередньо рахуємо середні дохідності кожного активу (щоб не рахувати в циклі)
            var expectedReturns = new double[n];
            for (int i = 0; i < n; i++)
            {
                // Множимо на кількість торгових днів, щоб отримати річну дохідність
                expectedReturns[i] = assetReturns[tickers[i]].Average() * Constants.TradingDaysPerYear; 
            }

            // 2. Попередньо рахуємо матрицю коваріацій (річну)
            var covarianceMatrix = new double[n, n];
            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < n; j++)
                {
                    covarianceMatrix[i, j] = MatrixCalculator.CalculateCovariance(
                        assetReturns[tickers[i]], 
                        assetReturns[tickers[j]]) * Constants.TradingDaysPerYear;
                }
            }

            var bestResult = new MarkowitzResult { SharpeRatio = double.MinValue };
            var currentWeights = new double[n];

            // 3. Генеруємо тисячі випадкових портфелів
            for (int sim = 0; sim < simulations; sim++)
            {
                double weightSum = 0;
                
                // Генеруємо випадкові ваги
                for (int i = 0; i < n; i++)
                {
                    currentWeights[i] = Random.Shared.NextDouble();
                    weightSum += currentWeights[i];
                }

                // Нормалізуємо ваги, щоб їхня сума завжди дорівнювала 1 (100%)
                for (int i = 0; i < n; i++)
                {
                    currentWeights[i] /= weightSum;
                }

                // 4. Рахуємо дохідність цього конкретного випадкового портфеля
                double portReturn = 0;
                for (int i = 0; i < n; i++)
                {
                    portReturn += currentWeights[i] * expectedReturns[i];
                }

                // 5. Рахуємо ризик (дисперсію) портфеля
                double portVariance = 0;
                for (int i = 0; i < n; i++)
                {
                    for (int j = 0; j < n; j++)
                    {
                        portVariance += currentWeights[i] * currentWeights[j] * covarianceMatrix[i, j];
                    }
                }
                double portVolatility = Math.Sqrt(portVariance);

                // 6. Рахуємо Шарп
                double sharpe = (portReturn - riskFreeRate) / portVolatility;

                // 7. Зберігаємо найкращий результат
                if (sharpe > bestResult.SharpeRatio)
                {
                    bestResult.SharpeRatio = sharpe;
                    bestResult.ExpectedReturn = portReturn;
                    bestResult.Volatility = portVolatility;
                    
                    bestResult.OptimalWeights.Clear();
                    for (int i = 0; i < n; i++)
                    {
                        // Зберігаємо ваги у відсотках (наприклад, 0.45 -> 45%)
                        bestResult.OptimalWeights[tickers[i]] = Math.Round(currentWeights[i], 4);
                    }
                }
            }

            return bestResult;
        }
    }
}
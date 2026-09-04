using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
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
            var syncLock = new object();

            Parallel.For(0, simulations, () => new MarkowitzResult { SharpeRatio = double.MinValue },
                (sim, loop, localBest) =>
                {
                    var currentWeights = new double[n];
                    double weightSum = 0;
                    
                    var rng = Random.Shared;

                    for (int i = 0; i < n; i++)
                    {
                        currentWeights[i] = rng.NextDouble();
                        weightSum += currentWeights[i];
                    }

                    for (int i = 0; i < n; i++)
                    {
                        currentWeights[i] /= weightSum;
                    }

                    double portReturn = 0;
                    for (int i = 0; i < n; i++)
                    {
                        portReturn += currentWeights[i] * expectedReturns[i];
                    }

                    double portVariance = 0;
                    for (int i = 0; i < n; i++)
                    {
                        for (int j = 0; j < n; j++)
                        {
                            portVariance += currentWeights[i] * currentWeights[j] * covarianceMatrix[i, j];
                        }
                    }
                    double portVolatility = Math.Sqrt(portVariance);
                    double sharpe = (portReturn - riskFreeRate) / portVolatility;

                    if (sharpe > localBest.SharpeRatio)
                    {
                        localBest.SharpeRatio = sharpe;
                        localBest.ExpectedReturn = portReturn;
                        localBest.Volatility = portVolatility;
                        
                        localBest.OptimalWeights.Clear();
                        for (int i = 0; i < n; i++)
                        {
                            localBest.OptimalWeights[tickers[i]] = Math.Round(currentWeights[i], 4);
                        }
                    }

                    return localBest;
                },
                localBest =>
                {
                    lock (syncLock)
                    {
                        if (localBest.SharpeRatio > bestResult.SharpeRatio)
                        {
                            bestResult.SharpeRatio = localBest.SharpeRatio;
                            bestResult.ExpectedReturn = localBest.ExpectedReturn;
                            bestResult.Volatility = localBest.Volatility;
                            bestResult.OptimalWeights = new Dictionary<string, double>(localBest.OptimalWeights);
                        }
                    }
                });

            return bestResult;
        }
    }
}
using System;
using System.Collections.Generic;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Generators;

namespace RiskMate.MathEngine.Simulators
{
    public class MonteCarloSimulator
    {
        /// <summary>
        /// Генерує матрицю майбутніх цінових шляхів.
        /// </summary>
        /// <param name="parameters">Параметри активу (InitialPrice, Drift, Volatility)</param>
        /// <param name="simulationsCount">Кількість шляхів (наприклад, 10 000)</param>
        /// <param name="horizon">Горизонт прогнозування в днях (наприклад, 30)</param>
        /// <returns>Список списків, де кожен внутрішній список — це один згенерований шлях ціни.</returns>
        public List<List<double>> Simulate(AssetParameters parameters, int simulationsCount, int horizon)
        {
            var allPaths = new List<List<double>>(simulationsCount);

            for (int i = 0; i < simulationsCount; i++)
            {
                var path = new List<double>(horizon + 1);
                path.Add(parameters.InitialPrice); // Нульовий день — поточна ціна
                
                double currentPrice = parameters.InitialPrice;

                for (int day = 1; day <= horizon; day++)
                {
                    double randomShock = NormalDistribution.Sample();
                    
                    // Обчислюємо ціну наступного дня за моделлю GBM
                    currentPrice *= Math.Exp(parameters.Drift + parameters.Volatility * randomShock);
                    path.Add(currentPrice);
                }
                
                allPaths.Add(path);
            }

            return allPaths;
        }
    }
}
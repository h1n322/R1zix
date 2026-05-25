using System;
using System.Collections.Generic;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Generators;

namespace RiskMate.MathEngine.Simulators
{
    public class GarchSimulator
    {
        /// <summary>
        /// Симуляція з динамічною волатильністю (GARCH).
        /// </summary>
        /// <param name="omega">Базова константа дисперсії (дуже мале число, напр. 0.00001)</param>
        /// <param name="alpha">Реакція на вчорашній шок (напр. 0.1)</param>
        /// <param name="beta">Інерція старої волатильності (напр. 0.85)</param>
        public List<List<double>> Simulate(
            AssetParameters parameters, 
            int simulationsCount, 
            int horizon,
            double omega = 0.00001, 
            double alpha = 0.1, 
            double beta = 0.85)
        {
            var allPaths = new List<List<double>>(simulationsCount);
            
            // Зверни увагу: сума alpha + beta має бути меншою за 1, щоб модель була стабільною.

            for (int i = 0; i < simulationsCount; i++)
            {
                var path = new List<double>(horizon + 1) { parameters.InitialPrice };
                double currentPrice = parameters.InitialPrice;
                
                // Початкова дисперсія (квадрат історичної волатильності)
                double currentVariance = Math.Pow(parameters.Volatility, 2);

                for (int day = 1; day <= horizon; day++)
                {
                    double shock = NormalDistribution.Sample();
                    
                    // Поточна волатильність для цього конкретного дня
                    double currentDailyVolatility = Math.Sqrt(currentVariance);
                    
                    // Розраховуємо ціну
                    double returnForDay = parameters.Drift + currentDailyVolatility * shock;
                    currentPrice *= Math.Exp(returnForDay);
                    path.Add(currentPrice);

                    // ОНОВЛЮЄМО ВОЛАТИЛЬНІСТЬ НА ЗАВТРА ЗА МОДЕЛЛЮ GARCH(1,1)
                    // shock^2 * currentVariance — це квадрат вчорашньої "помилки" (дохідності)
                    currentVariance = omega + alpha * (Math.Pow(shock * currentDailyVolatility, 2)) + beta * currentVariance;
                }
                
                allPaths.Add(path);
            }

            return allPaths;
        }
    }
}
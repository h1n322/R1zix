using System;
using System.Collections.Generic;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Generators;

namespace RiskMate.MathEngine.Simulators
{
    public class MertonJumpSimulator
    {
        /// <summary>
        /// Симуляція з урахуванням раптових цінових стрибків (гепів).
        /// </summary>
        /// <param name="jumpIntensity">Середня кількість стрибків за рік (наприклад, 2.0)</param>
        /// <param name="jumpMean">Середній розмір стрибка у відсотках (наприклад, 0.0 для симетричних, або -0.05 для паніки)</param>
        /// <param name="jumpVolatility">Волатильність самого стрибка (наприклад, 0.1)</param>
        public List<List<double>> Simulate(
            AssetParameters parameters, 
            int simulationsCount, 
            int horizon, 
            double jumpIntensity = 2.0, 
            double jumpMean = 0.0, 
            double jumpVolatility = 0.1)
        {
            var allPaths = new List<List<double>>(simulationsCount);
            
            // Денна ймовірність стрибка
            double dailyJumpProbability = jumpIntensity / Constants.TradingDaysPerYear;

            for (int i = 0; i < simulationsCount; i++)
            {
                var path = new List<double>(horizon + 1) { parameters.InitialPrice };
                double currentPrice = parameters.InitialPrice;

                for (int day = 1; day <= horizon; day++)
                {
                    double normalShock = NormalDistribution.Sample();
                    
                    // Базовий плавний рух (як у GBM)
                    double returnForDay = parameters.Drift + parameters.Volatility * normalShock;

                    // Перевіряємо, чи відбувся раптовий стрибок сьогодні (Пуассонівський процес)
                    if (Random.Shared.NextDouble() < dailyJumpProbability)
                    {
                        // Якщо так, генеруємо розмір цього стрибка
                        double jumpShock = NormalDistribution.Sample();
                        double jumpMagnitude = jumpMean + jumpVolatility * jumpShock;
                        returnForDay += jumpMagnitude;
                    }

                    currentPrice *= Math.Exp(returnForDay);
                    path.Add(currentPrice);
                }
                
                allPaths.Add(path);
            }

            return allPaths;
        }
    }
}
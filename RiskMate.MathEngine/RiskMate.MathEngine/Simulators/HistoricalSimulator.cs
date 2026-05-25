using System;
using System.Collections.Generic;
using RiskMate.MathEngine.Models;

namespace RiskMate.MathEngine.Simulators
{
    public class HistoricalSimulator
    {
        private static readonly Random _random = new Random();

        public List<List<double>> Simulate(double initialPrice, List<double> historicalReturns, int simulationsCount, int horizon)
        {
            var allPaths = new List<List<double>>(simulationsCount);

            for (int i = 0; i < simulationsCount; i++)
            {
                var path = new List<double>(horizon + 1) { initialPrice };
                double currentPrice = initialPrice;

                for (int day = 1; day <= horizon; day++)
                {
                    // Випадково витягуємо реальну дохідність з минулого
                    int randomIndex = _random.Next(historicalReturns.Count);
                    double sampledReturn = historicalReturns[randomIndex];
                    
                    // Застосовуємо історичну дохідність
                    currentPrice *= Math.Exp(sampledReturn);
                    path.Add(currentPrice);
                }
                allPaths.Add(path);
            }

            return allPaths;
        }
    }
}
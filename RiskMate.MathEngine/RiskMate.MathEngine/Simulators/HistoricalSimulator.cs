using System;
using System.Collections.Generic;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Generators;

namespace RiskMate.MathEngine.Simulators
{
    public class HistoricalSimulator
    {
        public List<List<double>> Simulate(double initialPrice, List<double> historicalReturns, int simulationsCount, int horizon, IRandomProvider rng)
        {
            var allPaths = new List<List<double>>(simulationsCount);

            for (int i = 0; i < simulationsCount; i++)
            {
                var path = new List<double>(horizon + 1) { initialPrice };
                double currentPrice = initialPrice;

                for (int day = 1; day <= horizon; day++)
                {
                    int randomIndex = rng.Next(historicalReturns.Count);
                    double sampledReturn = historicalReturns[randomIndex];
                    
                    currentPrice *= Math.Exp(sampledReturn);
                    path.Add(currentPrice);
                }
                allPaths.Add(path);
            }

            return allPaths;
        }
    }
}
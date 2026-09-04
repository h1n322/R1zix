using System;
using System.Collections.Generic;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Generators;

namespace RiskMate.MathEngine.Simulators
{
    public class MertonJumpSimulator
    {
        public List<List<double>> Simulate(
            AssetParameters parameters, 
            int simulationsCount, 
            int horizon, 
            double jumpIntensity = 2.0, 
            double jumpMean = 0.0, 
            double jumpVolatility = 0.1,
            IRandomProvider rng = null)
        {
            var allPaths = new List<List<double>>(simulationsCount);
            
            double dt = 1.0;
            double sqrtDt = Math.Sqrt(dt);
            double dailyJumpProbability = jumpIntensity / Constants.TradingDaysPerYear;
            
            // Компенсатор стрибків: оскільки historical drift вже включає історичні стрибки,
            // ми повинні відняти математичне очікування стрибка, щоб не подвоювати прибутковість.
            // Математичне очікування стрибка за день = ймовірність * середній розмір.
            double jumpCompensator = dailyJumpProbability * jumpMean;
            double adjustedDrift = parameters.Drift - jumpCompensator;

            for (int i = 0; i < simulationsCount; i++)
            {
                var path = new List<double>(horizon + 1) { parameters.InitialPrice };
                double currentPrice = parameters.InitialPrice;

                for (int day = 1; day <= horizon; day++)
                {
                    double normalShock = rng.SampleNormal();
                    double returnForDay = adjustedDrift * dt + parameters.Volatility * sqrtDt * normalShock;

                    if (rng.NextDouble() < dailyJumpProbability)
                    {
                        double jumpShock = rng.SampleNormal();
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

using System;
using System.Collections.Generic;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Generators;

namespace RiskMate.MathEngine.Simulators
{
    public class GarchSimulator
    {
        public List<List<double>> Simulate(
            AssetParameters parameters, 
            int simulationsCount, 
            int horizon,
            double omega = 0.00001, 
            double alpha = 0.1, 
            double beta = 0.85)
        {
            // Перевірка стаціонарності GARCH
            if (alpha + beta >= 1.0)
            {
                throw new ArgumentException($"Нестаціонарні параметри GARCH: alpha ({alpha}) + beta ({beta}) має бути < 1");
            }

            var allPaths = new List<List<double>>(simulationsCount);
            double dt = 1.0;
            double sqrtDt = Math.Sqrt(dt);

            for (int i = 0; i < simulationsCount; i++)
            {
                var path = new List<double>(horizon + 1) { parameters.InitialPrice };
                double currentPrice = parameters.InitialPrice;
                double currentVariance = Math.Pow(parameters.Volatility, 2);

                for (int day = 1; day <= horizon; day++)
                {
                    double shock = NormalDistribution.Sample();
                    double currentDailyVolatility = Math.Sqrt(currentVariance);
                    
                    double returnForDay = parameters.Drift * dt + currentDailyVolatility * sqrtDt * shock;
                    currentPrice *= Math.Exp(returnForDay);
                    path.Add(currentPrice);

                    // Оновлення дисперсії за моделлю GARCH(1,1)
                    currentVariance = omega + alpha * Math.Pow(shock * currentDailyVolatility, 2) + beta * currentVariance;
                }
                
                allPaths.Add(path);
            }

            return allPaths;
        }
    }
}

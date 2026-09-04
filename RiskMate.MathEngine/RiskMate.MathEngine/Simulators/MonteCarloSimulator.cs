using System;
using System.Collections.Generic;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Generators;

namespace RiskMate.MathEngine.Simulators
{
    public class MonteCarloSimulator
    {
        public List<List<double>> Simulate(AssetParameters parameters, int simulationsCount, int horizon)
        {
            var allPaths = new List<List<double>>(simulationsCount);
            
            // dt = 1 день (всі параметри вже в денному масштабі)
            double dt = 1.0;
            double sqrtDt = Math.Sqrt(dt);

            for (int i = 0; i < simulationsCount; i++)
            {
                var path = new List<double>(horizon + 1);
                path.Add(parameters.InitialPrice);
                
                double currentPrice = parameters.InitialPrice;

                for (int day = 1; day <= horizon; day++)
                {
                    double randomShock = NormalDistribution.Sample();
                    
                    // S(t+dt) = S(t) * exp(drift * dt + vol * sqrt(dt) * Z)
                    currentPrice *= Math.Exp(parameters.Drift * dt + parameters.Volatility * sqrtDt * randomShock);
                    path.Add(currentPrice);
                }
                
                allPaths.Add(path);
            }

            return allPaths;
        }
    }
}

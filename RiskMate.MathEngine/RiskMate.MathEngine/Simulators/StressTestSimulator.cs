using System;
using System.Collections.Generic;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Generators;

namespace RiskMate.MathEngine.Simulators
{
    public class StressTestSimulator
    {
        /// <summary>
        /// Генерує шляхи ціни з урахуванням макроекономічного шоку в перший день симуляції.
        /// </summary>
        public List<List<double>> Simulate(
            AssetParameters parameters, 
            int simulationsCount, 
            int horizon, 
            StressScenario scenario, 
            double customShockPercentage = 0.0)
        {
            // 1. Визначаємо мультиплікатор падіння
            double shockModifier = GetShockModifier(scenario, customShockPercentage);
            
            var allPaths = new List<List<double>>(simulationsCount);

            for (int i = 0; i < simulationsCount; i++)
            {
                var path = new List<double>(horizon + 1);
                
                // День 0: Поточна ціна
                path.Add(parameters.InitialPrice); 

                // День 1: УДАР "ЧОРНОГО ЛЕБЕДЯ" (Застосовуємо жорсткий шок)
                double currentPrice = parameters.InitialPrice * shockModifier;
                path.Add(currentPrice);

                // День 2 і далі: Намагаємося відновитися (або падаємо далі) за допомогою Монте-Карло
                for (int day = 2; day <= horizon; day++)
                {
                    double randomShock = NormalDistribution.Sample();
                    
                    // Використовуємо ту саму математику GBM
                    currentPrice *= Math.Exp(parameters.Drift + parameters.Volatility * randomShock);
                    path.Add(currentPrice);
                }
                
                allPaths.Add(path);
            }

            return allPaths;
        }

        /// <summary>
        /// Повертає коефіцієнт, на який помножиться ціна під час кризи.
        /// </summary>
        private double GetShockModifier(StressScenario scenario, double customShockPercentage)
        {
            return scenario switch
            {
                StressScenario.Covid19Crash => 0.75,      // -25%
                StressScenario.FinancialCrisis08 => 0.65, // -35%
                StressScenario.DotComBubble00 => 0.50,    // -50% (Або 0.22 для чистого NASDAQ)
                StressScenario.BlackMonday87 => 0.774,    // -22.6%
                StressScenario.CustomShock => 1.0 - Math.Abs(customShockPercentage), 
                _ => 1.0
            };
        }
    }
}
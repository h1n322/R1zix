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
            double customShockPercentage = 0.0,
            IRandomProvider rng = null)
        {
            // 1. Визначаємо мультиплікатор падіння для першого дня
            double shockModifier = GetShockModifier(scenario, customShockPercentage);
            
            // 2. Модифікуємо параметри GBM для тривалого ефекту кризи
            // У кризу ринок в середньому падає, тому примусово робимо дрифт негативним
            // А волатильність зростає мінімум у 2.5 - 3 рази
            double crisisVolatility = parameters.Volatility * 2.5; 
            double crisisDrift = -0.40 / 252.0; // Приблизно -40% річних, розбито на дні

            // Для кастомного шоку залишаємо лише перший удар, якщо не задано інше, але за замовчуванням зробимо волатильнішим
            if (scenario == StressScenario.CustomShock)
            {
                crisisDrift = parameters.Drift; // Залишаємо звичайний дрифт
                crisisVolatility = parameters.Volatility * 1.5;
            }

            var allPaths = new List<List<double>>(simulationsCount);

            for (int i = 0; i < simulationsCount; i++)
            {
                var path = new List<double>(horizon + 1);
                
                // День 0: Поточна ціна
                path.Add(parameters.InitialPrice); 

                // День 1: УДАР "ЧОРНОГО ЛЕБЕДЯ" (Застосовуємо жорсткий шок)
                double currentPrice = parameters.InitialPrice * shockModifier;
                path.Add(currentPrice);

                // День 2 і далі: Тривала криза з підвищеною волатильністю і негативним дрифтом
                for (int day = 2; day <= horizon; day++)
                {
                    double randomShock = rng.SampleNormal();
                    
                    // Використовуємо модифіковану математику GBM
                    currentPrice *= Math.Exp(crisisDrift + crisisVolatility * randomShock);
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
                StressScenario.CustomShock => 1.0 - Math.Clamp(Math.Abs(customShockPercentage), 0, 0.99), 
                _ => 1.0
            };
        }
    }
}
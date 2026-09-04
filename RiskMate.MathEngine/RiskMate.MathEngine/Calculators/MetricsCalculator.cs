using System;
using System.Collections.Generic;
using System.Linq;

namespace RiskMate.MathEngine.Calculators
{
    public static class MetricsCalculator
    {
        public static (double ExpectedPrice, double ValueAtRisk, double ConditionalValueAtRisk) CalculateMetrics(
            double[][] paths, double confidenceLevel = 0.95)
        {
            if (paths.Length == 0) return (0, 0, 0);
            int horizon = paths[0].Length - 1;

            var finalPrices = new double[paths.Length];
            for (int i = 0; i < paths.Length; i++)
            {
                finalPrices[i] = paths[i][horizon];
            }
            
            double expectedPrice = finalPrices.Average();
            double s0 = paths[0].Length > 0 ? paths[0][0] : expectedPrice;

            // Зводимо до розподілу збитків (Loss Distribution)
            var losses = new double[finalPrices.Length];
            for (int i = 0; i < finalPrices.Length; i++)
            {
                losses[i] = s0 - finalPrices[i];
            }
            Array.Sort(losses); // Сортуємо: від максимального прибутку до максимального збитку

            int originalIndex = (int)Math.Floor(finalPrices.Length * (1.0 - confidenceLevel));
            originalIndex = Math.Clamp(originalIndex, 0, finalPrices.Length - 1);
            
            int varIndex = losses.Length - 1 - originalIndex;
            
            double valueAtRisk = Math.Max(0, losses[varIndex]);

            int cvarSkipCount = losses.Length - originalIndex;
            
            double sumCvar = 0.0;
            int cvarCount = 0;
            for (int i = cvarSkipCount; i < losses.Length; i++)
            {
                sumCvar += losses[i];
                cvarCount++;
            }

            double conditionalValueAtRisk = originalIndex > 0 && cvarCount > 0
                ? sumCvar / cvarCount
                : losses[losses.Length - 1];
                
            conditionalValueAtRisk = Math.Max(0, conditionalValueAtRisk);

            return (expectedPrice, valueAtRisk, conditionalValueAtRisk);
        }

        public static double CalculateExpectedPrice(double[][] paths)
        {
            if (paths.Length == 0) return 0;
            int horizon = paths[0].Length - 1;
            return paths.Average(p => p[horizon]);
        }

        public static double CalculateVaR(double[][] paths, double confidenceLevel = 0.95)
        {
            var (_, var, _) = CalculateMetrics(paths, confidenceLevel);
            return var;
        }

        public static double CalculateCVaR(double[][] paths, double confidenceLevel = 0.95)
        {
            var (_, _, cvar) = CalculateMetrics(paths, confidenceLevel);
            return cvar;
        }
    }
}

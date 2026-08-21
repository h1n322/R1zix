using System;
using System.Collections.Generic;
using System.Linq;

namespace RiskMate.MathEngine.Calculators
{
    public static class MetricsCalculator
    {
        public static (double ExpectedPrice, double ValueAtRisk, double ConditionalValueAtRisk) CalculateMetrics(
            List<List<double>> paths, double confidenceLevel = 0.95)
        {
            var finalPrices = paths.Select(p => p.Last()).ToList();
            finalPrices.Sort();

            double expectedPrice = finalPrices.Average();
            double s0 = paths.Count > 0 && paths[0].Count > 0 ? paths[0][0] : expectedPrice;

            int index = (int)Math.Floor(finalPrices.Count * (1.0 - confidenceLevel));
            index = Math.Clamp(index, 0, finalPrices.Count - 1);

            double pVar = finalPrices[index];
            double valueAtRisk = Math.Max(0, s0 - pVar);

            double pCvar = index > 0
                ? finalPrices.Take(index).Average()
                : finalPrices[0];
            double conditionalValueAtRisk = Math.Max(0, s0 - pCvar);

            return (expectedPrice, valueAtRisk, conditionalValueAtRisk);
        }

        public static double CalculateExpectedPrice(List<List<double>> paths)
        {
            return paths.Select(p => p.Last()).Average();
        }

        public static double CalculateVaR(List<List<double>> paths, double confidenceLevel = 0.95)
        {
            var finalPrices = paths.Select(p => p.Last()).ToList();
            finalPrices.Sort();

            double s0 = paths.Count > 0 && paths[0].Count > 0 ? paths[0][0] : finalPrices.Average();
            int index = (int)Math.Floor(finalPrices.Count * (1.0 - confidenceLevel));
            index = Math.Clamp(index, 0, finalPrices.Count - 1);
            return Math.Max(0, s0 - finalPrices[index]);
        }

        public static double CalculateCVaR(List<List<double>> paths, double confidenceLevel = 0.95)
        {
            var finalPrices = paths.Select(p => p.Last()).ToList();
            finalPrices.Sort();

            double s0 = paths.Count > 0 && paths[0].Count > 0 ? paths[0][0] : finalPrices.Average();
            int index = (int)Math.Floor(finalPrices.Count * (1.0 - confidenceLevel));
            index = Math.Clamp(index, 0, finalPrices.Count - 1);

            double pCvar = index > 0 ? finalPrices.Take(index).Average() : finalPrices[0];
            return Math.Max(0, s0 - pCvar);
        }
    }
}
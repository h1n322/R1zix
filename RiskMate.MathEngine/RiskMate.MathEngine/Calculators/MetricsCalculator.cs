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
            double expectedPrice = finalPrices.Average();
            double s0 = paths.Count > 0 && paths[0].Count > 0 ? paths[0][0] : expectedPrice;

            // Зводимо до розподілу збитків (Loss Distribution)
            var losses = finalPrices.Select(p => s0 - p).ToList();
            losses.Sort(); // Сортуємо: від максимального прибутку до максимального збитку

            // Щоб математично 100% співпадати з попередньою логікою на основі цін:
            int originalIndex = (int)Math.Floor(finalPrices.Count * (1.0 - confidenceLevel));
            originalIndex = Math.Clamp(originalIndex, 0, finalPrices.Count - 1);
            
            // Якщо finalPrices сортувалися за зростанням, то pVar = finalPrices[originalIndex].
            // Відповідний елемент у відсортованих losses буде під індексом (Count - 1 - originalIndex)
            int varIndex = losses.Count - 1 - originalIndex;
            
            double valueAtRisk = Math.Max(0, losses[varIndex]);

            // Старий CVaR брав Average() від 0 до originalIndex - 1 (включно).
            // Це відповідає елементами losses від (Count - originalIndex) до кінця.
            int cvarSkipCount = losses.Count - originalIndex;
            double conditionalValueAtRisk = originalIndex > 0
                ? losses.Skip(cvarSkipCount).Average()
                : losses.Last();
                
            conditionalValueAtRisk = Math.Max(0, conditionalValueAtRisk);

            return (expectedPrice, valueAtRisk, conditionalValueAtRisk);
        }

        public static double CalculateExpectedPrice(List<List<double>> paths)
        {
            return paths.Select(p => p.Last()).Average();
        }

        public static double CalculateVaR(List<List<double>> paths, double confidenceLevel = 0.95)
        {
            var (_, var, _) = CalculateMetrics(paths, confidenceLevel);
            return var;
        }

        public static double CalculateCVaR(List<List<double>> paths, double confidenceLevel = 0.95)
        {
            var (_, _, cvar) = CalculateMetrics(paths, confidenceLevel);
            return cvar;
        }
    }
}

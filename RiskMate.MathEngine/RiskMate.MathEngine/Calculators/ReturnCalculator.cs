using System;
using System.Collections.Generic;

namespace RiskMate.MathEngine.Calculators
{
    public static class ReturnsCalculator
    {
        public static List<double> CalculateLogReturns(List<double> prices)
        {
            var returns = new List<double>();
            for (int i = 1; i < prices.Count; i++)
            {
                returns.Add(Math.Log(prices[i] / prices[i - 1]));
            }
            return returns;
        }

        // На майбутнє: якщо для якихось моделей знадобляться звичайні відсотки
        public static List<double> CalculateSimpleReturns(List<double> prices)
        {
            var returns = new List<double>();
            for (int i = 1; i < prices.Count; i++)
            {
                returns.Add((prices[i] - prices[i - 1]) / prices[i - 1]);
            }
            return returns;
        }
    }
}
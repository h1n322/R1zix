using System;
using System.Collections.Generic;
using System.Linq;

namespace RiskMate.MathEngine.Calculators
{
    public static class MetricsCalculator
    {
        public static double CalculateExpectedPrice(List<List<double>> paths)
        {
            // Берем последний день (Last) каждого пути и находим среднее арифметическое
            return paths.Select(p => p.Last()).Average();
        }

        public static double CalculateVaR(List<List<double>> paths, double confidenceLevel = 0.95)
        {
            var finalPrices = paths.Select(p => p.Last()).ToList();
            finalPrices.Sort(); // Сортируем от худшего к лучшему
            
            // Находим точку 5% худших результатов
            int index = (int)Math.Floor(finalPrices.Count * (1.0 - confidenceLevel));
            return finalPrices[index];
        }

        public static double CalculateCVaR(List<List<double>> paths, double confidenceLevel = 0.95)
        {
            var finalPrices = paths.Select(p => p.Last()).ToList();
            finalPrices.Sort();
            
            int index = (int)Math.Floor(finalPrices.Count * (1.0 - confidenceLevel));
            
            // Находим среднее значение среди всех пробивших VaR результатов (левее точки VaR)
            return finalPrices.Take(index).Average();
        }
    }
}
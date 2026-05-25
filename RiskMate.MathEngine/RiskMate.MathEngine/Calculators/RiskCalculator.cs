using System;
using System.Collections.Generic;
using System.Linq;

namespace RiskMate.MathEngine.Calculators
{
    public static class RiskCalculator
    {
        public static double CalculateVolatility(List<double> returns)
        {
            if (returns.Count <= 1) return 0;

            double mean = returns.Average();
            double sumOfSquares = returns.Sum(r => Math.Pow(r - mean, 2));
            double variance = sumOfSquares / (returns.Count - 1); 
            
            return Math.Sqrt(variance);
        }
    }
}
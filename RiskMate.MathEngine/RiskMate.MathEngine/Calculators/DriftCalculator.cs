using System;

namespace RiskMate.MathEngine.Calculators
{
    public static class DriftCalculator
    {
        public static double CalculateGbmDrift(double meanReturn, double volatility)
        {
            return meanReturn - (Math.Pow(volatility, 2) / 2.0);
        }
    }
}
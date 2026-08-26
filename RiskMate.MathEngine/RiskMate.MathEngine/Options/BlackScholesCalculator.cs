using System;

namespace RiskMate.MathEngine.Options
{
    public class HedgingSuggestion
    {
        public double StrikePrice { get; set; }
        public double PutOptionPremium { get; set; }
        public double TotalCostFor100Shares { get; set; }
        public string? Expiration { get; set; }
    }

    public static class BlackScholesCalculator
    {
        public static HedgingSuggestion? CalculatePutOption(double currentPrice, double strikePrice, double timeToExpirationYears, double riskFreeRate, double volatility)
        {
            if (timeToExpirationYears <= 0 || volatility <= 0 || currentPrice <= 0 || strikePrice <= 0)
                return null;

            double d1 = (Math.Log(currentPrice / strikePrice) + (riskFreeRate + Math.Pow(volatility, 2) / 2.0) * timeToExpirationYears) / (volatility * Math.Sqrt(timeToExpirationYears));
            double d2 = d1 - volatility * Math.Sqrt(timeToExpirationYears);

            double putPremium = strikePrice * Math.Exp(-riskFreeRate * timeToExpirationYears) * NormalCDF(-d2) - currentPrice * NormalCDF(-d1);

            return new HedgingSuggestion
            {
                StrikePrice = strikePrice,
                PutOptionPremium = putPremium,
                TotalCostFor100Shares = putPremium * 100.0,
                Expiration = $"{Math.Round(timeToExpirationYears * 365)} днів"
            };
        }

        private static double NormalCDF(double x)
        {
            // Наближення Абромовіца і Стегана для нормального кумулятивного розподілу
            double a1 = 0.254829592;
            double a2 = -0.284496736;
            double a3 = 1.421413741;
            double a4 = -1.453152027;
            double a5 = 1.061405429;
            double p = 0.3275911;

            int sign = x < 0 ? -1 : 1;
            x = Math.Abs(x) / Math.Sqrt(2.0);

            double t = 1.0 / (1.0 + p * x);
            double y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.Exp(-x * x);

            return 0.5 * (1.0 + sign * y);
        }
    }
}

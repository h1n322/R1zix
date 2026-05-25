using System.Collections.Generic;

namespace RiskMate.MathEngine.Models
{
    public class MarkowitzResult
    {
        public Dictionary<string, double> OptimalWeights { get; set; } = new();
        public double ExpectedReturn { get; set; }
        public double Volatility { get; set; }
        public double SharpeRatio { get; set; }
    }
}
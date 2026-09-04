using System.Collections.Generic;
using RiskMate.MathEngine.Calculators;
using Xunit;

namespace RiskMate.MathEngine.Tests.Calculators
{
    public class RiskCalculatorTests
    {
        [Fact]
        public void CalculateVolatility_ShouldReturnStandardDeviation()
        {
            // Population standard deviation or Sample standard deviation?
            // RiskCalculator usually returns sample std.
            var returns = new List<double> { 0.05, -0.02, 0.03, 0.01 };
            double vol = RiskCalculator.CalculateVolatility(returns);
            // Mean = 0.0175
            // Variance = ((0.05 - 0.0175)^2 + (-0.02 - 0.0175)^2 + (0.03 - 0.0175)^2 + (0.01 - 0.0175)^2) / 3
            // Var = (0.00105625 + 0.00140625 + 0.00015625 + 0.00005625) / 3 = 0.002675 / 3 = 0.000891666...
            // StdDev = Math.Sqrt(0.000891666) = 0.02986
            Assert.Equal(0.02986, vol, 4);
        }
    }
}

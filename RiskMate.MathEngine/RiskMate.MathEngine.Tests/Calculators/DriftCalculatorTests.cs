using System.Collections.Generic;
using RiskMate.MathEngine.Calculators;
using Xunit;

namespace RiskMate.MathEngine.Tests.Calculators
{
    public class DriftCalculatorTests
    {
        [Fact]
        public void CalculateGbmDrift_ShouldReturnCorrectDrift()
        {
            double drift = DriftCalculator.CalculateGbmDrift(0.05, 0.2); // 0.05 - (0.04 / 2) = 0.03
            Assert.Equal(0.03, drift, 4);
        }
    }
}

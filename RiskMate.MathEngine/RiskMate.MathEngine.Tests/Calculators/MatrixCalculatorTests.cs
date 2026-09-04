using System.Collections.Generic;
using RiskMate.MathEngine.Calculators;
using Xunit;

namespace RiskMate.MathEngine.Tests.Calculators
{
    public class MatrixCalculatorTests
    {
        [Fact]
        public void CalculateCovariance_ShouldReturnCorrectCovariance()
        {
            var ret1 = new List<double> { 0.02, 0.04, -0.01 };
            var ret2 = new List<double> { 0.01, 0.05, -0.02 };
            double cov = MatrixCalculator.CalculateCovariance(ret1, ret2);
            // Means: 0.01666, 0.01333
            // Cov = Sum((r1 - m1)*(r2 - m2)) / (n - 1)
            Assert.Equal(0.0009166, cov, 4);
        }
    }
}

using System.Collections.Generic;
using RiskMate.MathEngine.Calculators;
using Xunit;
using System;

namespace RiskMate.MathEngine.Tests.Calculators
{
    public class MetricsCalculatorTests
    {
        [Fact]
        public void CalculateMetrics_ValidPaths_ReturnsCorrectMetrics()
        {
            // Arrange
            var paths = new double[][]
            {
                new double[] { 100.0, 90.0 }, // Path 1: Initial 100, Final 90
                new double[] { 100.0, 95.0 }, // Path 2: Initial 100, Final 95
                new double[] { 100.0, 105.0 }, // Path 3: Initial 100, Final 105
                new double[] { 100.0, 110.0 }  // Path 4: Initial 100, Final 110
            };
            
            // Expected Final Prices sorted: 90.0, 95.0, 105.0, 110.0
            // ConfidenceLevel: 0.75 -> 1 - 0.75 = 0.25
            // index = floor(4 * 0.25) = 1 (price 95.0)
            // pVar = 95.0 -> VaR = 100 - 95.0 = 5.0
            // pCvar = Average of Take(1) -> Average(90.0) = 90.0 -> CVaR = 100 - 90.0 = 10.0
            // Expected = (90 + 95 + 105 + 110) / 4 = 100.0

            // Act
            var metrics = MetricsCalculator.CalculateMetrics(paths, 0.75);

            // Assert
            Assert.Equal(100.0, metrics.ExpectedPrice);
            Assert.Equal(5.0, metrics.ValueAtRisk);
            Assert.Equal(10.0, metrics.ConditionalValueAtRisk);
        }
    }
}

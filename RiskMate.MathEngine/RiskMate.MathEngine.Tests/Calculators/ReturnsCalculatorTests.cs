using System.Collections.Generic;
using RiskMate.MathEngine.Calculators;
using Xunit;
using System;

namespace RiskMate.MathEngine.Tests.Calculators
{
    public class ReturnsCalculatorTests
    {
        [Fact]
        public void CalculateLogReturns_ValidPrices_ReturnsCorrectLogReturns()
        {
            // Arrange
            var prices = new List<double> { 100.0, 105.0, 102.9 };

            // Act
            var logReturns = ReturnsCalculator.CalculateLogReturns(prices);

            // Assert
            Assert.Equal(2, logReturns.Count);
            Assert.Equal(Math.Log(105.0 / 100.0), logReturns[0], 5);
            Assert.Equal(Math.Log(102.9 / 105.0), logReturns[1], 5);
        }

        [Fact]
        public void CalculateLogReturns_ZeroOrNegativePrices_IgnoresInvalidPrices()
        {
            // Arrange
            var prices = new List<double> { 100.0, 0, 105.0, -10.0, 110.0, 121.0 };

            // Act
            var logReturns = ReturnsCalculator.CalculateLogReturns(prices);

            // Assert
            Assert.Single(logReturns);
            Assert.Equal(Math.Log(121.0 / 110.0), logReturns[0], 5);
        }

        [Fact]
        public void CalculateSimpleReturns_ValidPrices_ReturnsCorrectSimpleReturns()
        {
            // Arrange
            var prices = new List<double> { 100.0, 110.0, 121.0 };

            // Act
            var simpleReturns = ReturnsCalculator.CalculateSimpleReturns(prices);

            // Assert
            Assert.Equal(2, simpleReturns.Count);
            Assert.Equal(0.10, simpleReturns[0], 5);
            Assert.Equal(0.10, simpleReturns[1], 5);
        }
    }
}

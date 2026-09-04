using System;
using System.Collections.Generic;
using Xunit;
using RiskMate.MathEngine;
using RiskMate.MathEngine.Models;

namespace RiskMate.MathEngine.Tests.Regression
{
    public class RiskEngineRegressionTests
    {
        private List<double> GetMockHistoricalPrices()
        {
            var prices = new List<double>();
            double current = 100.0;
            for (int i = 0; i < 50; i++)
            {
                prices.Add(current);
                current *= (1.0 + 0.02 * Math.Sin(i));
            }
            return prices;
        }

        [Fact]
        public void Gbm_Simulation_ShouldMatchBaseline()
        {
            var engine = new RiskEngine();
            var prices = GetMockHistoricalPrices();
            var result = engine.RunSimulation(prices, SimulationAlgorithm.Gbm, 1000, 10);

            Assert.Equal(102.3193, result.ExpectedPrice, 4);
            Assert.Equal(6.6959, result.ValueAtRisk, 4);
            Assert.Equal(8.3065, result.ConditionalValueAtRisk, 4);
            Assert.Equal(22.5014, result.Volatility, 4);
            Assert.Equal(0.4079, result.SharpeRatio, 4);
        }

        [Fact]
        public void Garch_Simulation_ShouldMatchBaseline()
        {
            var engine = new RiskEngine();
            var prices = GetMockHistoricalPrices();
            var result = engine.RunSimulation(prices, SimulationAlgorithm.Garch, 1000, 10);

            Assert.Equal(102.3131, result.ExpectedPrice, 4);
            Assert.Equal(6.5141, result.ValueAtRisk, 4);
            Assert.Equal(8.4268, result.ConditionalValueAtRisk, 4);
        }

        [Fact]
        public void Merton_Simulation_ShouldMatchBaseline()
        {
            var engine = new RiskEngine();
            var prices = GetMockHistoricalPrices();
            var result = engine.RunSimulation(prices, SimulationAlgorithm.Merton, 1000, 10);

            Assert.Equal(102.4131, result.ExpectedPrice, 4);
            Assert.Equal(7.5552, result.ValueAtRisk, 4);
            Assert.Equal(10.9854, result.ConditionalValueAtRisk, 4);
        }

        [Fact]
        public void Historical_Simulation_ShouldMaintainInvariants()
        {
            var engine = new RiskEngine();
            var prices = GetMockHistoricalPrices();
            
            var result = engine.RunSimulation(prices, SimulationAlgorithm.Historical, 1000, 10);

            Assert.True(result.ExpectedPrice > 0, "Expected price should be positive");
            Assert.True(result.ValueAtRisk >= 0, "VaR should be non-negative");
            Assert.True(result.ConditionalValueAtRisk >= result.ValueAtRisk, "CVaR should be >= VaR");
            Assert.True(result.Volatility > 0, "Volatility should be positive");
        }
    }
}

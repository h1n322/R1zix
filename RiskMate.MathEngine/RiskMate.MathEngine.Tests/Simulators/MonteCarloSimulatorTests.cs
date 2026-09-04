using System;
using RiskMate.MathEngine.Simulators;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Generators;
using Xunit;

namespace RiskMate.MathEngine.Tests.Simulators
{
    public class FakeRandomProvider : IRandomProvider
    {
        private readonly double _normalValue;
        
        public FakeRandomProvider(double normalValue)
        {
            _normalValue = normalValue;
        }

        public double NextDouble() => 0.5;
        public int Next(int maxValue) => 0;
        public double SampleNormal() => _normalValue;
        
        public IRandomProvider Spawn(int seedOffset)
        {
            return this; // Для тестів повертаємо цей же фейковий провайдер
        }
    }

    public class MonteCarloSimulatorTests
    {
        [Fact]
        public void Simulate_ShouldCalculateExpectedPath()
        {
            var sim = new MonteCarloSimulator();
            var parameters = new AssetParameters
            {
                InitialPrice = 100,
                Drift = 0.0,
                Volatility = 0.1
            };
            
            // Якщо Normal == 1.0, drift = 0.0, vol = 0.1, dt = 1.0
            // Return = exp(0 + 0.1 * 1.0) = exp(0.1) = 1.10517
            // Price = 100 * 1.10517 = 110.517
            var fakeRng = new FakeRandomProvider(1.0);
            
            var paths = sim.Simulate(parameters, 1, 1, fakeRng);
            
            Assert.Single(paths);
            Assert.Equal(100.0, paths[0][0]);
            Assert.Equal(110.517, paths[0][1], 3);
        }
    }
}

using System;
using RiskMate.MathEngine.Simulators;
using RiskMate.MathEngine.Models;
using Xunit;

namespace RiskMate.MathEngine.Tests.Simulators
{
    public class GarchSimulatorTests
    {
        [Fact]
        public void Simulate_NonStationaryParameters_ShouldThrowException()
        {
            var sim = new GarchSimulator();
            var parameters = new AssetParameters { InitialPrice = 100, Drift = 0, Volatility = 0.1 };
            
            // alpha + beta = 0.5 + 0.6 = 1.1 >= 1.0 -> Exception
            var ex = Assert.Throws<ArgumentException>(() => sim.Simulate(parameters, 1, 1, 0.00001, 0.5, 0.6));
            Assert.Contains("Нестаціонарні параметри GARCH", ex.Message);
        }

        [Fact]
        public void Simulate_ShouldCalculateExpectedPath()
        {
            var sim = new GarchSimulator();
            var parameters = new AssetParameters { InitialPrice = 100, Drift = 0.0, Volatility = 0.1 };
            
            var fakeRng = new FakeRandomProvider(1.0);
            var paths = sim.Simulate(parameters, 1, 1, 0.00001, 0.1, 0.85, fakeRng);
            
            Assert.Single(paths);
            Assert.Equal(100.0, paths[0][0]);
            // return = exp(drift + vol * shock) = exp(0 + 0.1 * 1.0) = 1.10517
            Assert.Equal(110.517, paths[0][1], 3);
        }
    }
}

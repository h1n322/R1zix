using System.Collections.Generic;
using RiskMate.MathEngine.Optimizers;
using Xunit;

namespace RiskMate.MathEngine.Tests.Optimizers
{
    public class MarkowitzOptimizerTests
    {
        [Fact]
        public void Optimize_WithBetterAsset_ShouldAllocateMoreWeightToIt()
        {
            var optimizer = new MarkowitzOptimizer();
            var assetA = new List<double> { 0.05, 0.06, 0.04, 0.05, 0.06 }; 
            var assetB = new List<double> { -0.01, -0.02, 0.00, -0.01, -0.03 };

            var returns = new Dictionary<string, List<double>>
            {
                { "A", assetA },
                { "B", assetB }
            };

            var result = optimizer.Optimize(returns, 0.0, 10000); 

            Assert.True(result.OptimalWeights["A"] > result.OptimalWeights["B"], "Asset A should have higher weight than Asset B");
        }
    }
}

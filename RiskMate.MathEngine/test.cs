using System;
using System.Collections.Generic;
using RiskMate.MathEngine.Optimizers;
class Program {
    static void Main() {
        var opt = new MarkowitzOptimizer();
        var A = new List<double> { 0.05, 0.06, 0.04, 0.05, 0.06 }; 
        var B = new List<double> { -0.05, -0.06, -0.04, -0.05, -0.06 };
        var d = new Dictionary<string, List<double>> { {"A", A}, {"B", B} };
        var r = opt.Optimize(d, 0.0, 10000);
        Console.WriteLine($"A={r.OptimalWeights.GetValueOrDefault("A")}, B={r.OptimalWeights.GetValueOrDefault("B")}");
    }
}

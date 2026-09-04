using System;

namespace RiskMate.MathEngine.Generators
{
    public class RandomProvider : IRandomProvider
    {
        private readonly Random _random;

        public RandomProvider(int seed)
        {
            _random = new Random(seed);
        }

        public double NextDouble() => _random.NextDouble();

        public int Next(int maxValue) => _random.Next(maxValue);

        public double SampleNormal()
        {
            // Без кешування другого значення (зберігає сумісність з існуючою логікою)
            double u1 = 1.0 - _random.NextDouble(); 
            double u2 = 1.0 - _random.NextDouble();
            return Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Cos(2.0 * Math.PI * u2);
        }
    }
}

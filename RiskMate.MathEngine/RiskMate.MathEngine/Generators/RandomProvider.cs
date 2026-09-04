using System;

namespace RiskMate.MathEngine.Generators
{
    public class RandomProvider : IRandomProvider
    {
        private readonly int _baseSeed;
        private readonly Random _random;

        public RandomProvider(int seed)
        {
            _baseSeed = seed;
            _random = new Random(seed);
        }

        public double NextDouble() => _random.NextDouble();

        public int Next(int maxValue) => _random.Next(maxValue);

        public double SampleNormal()
        {
            double u1 = 1.0 - _random.NextDouble(); 
            double u2 = 1.0 - _random.NextDouble();
            return Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Cos(2.0 * Math.PI * u2);
        }

        public IRandomProvider Spawn(int seedOffset)
        {
            // Використовуємо хеш для кращої ентропії між гілками
            return new RandomProvider((_baseSeed * 397) ^ seedOffset.GetHashCode());
        }
    }
}

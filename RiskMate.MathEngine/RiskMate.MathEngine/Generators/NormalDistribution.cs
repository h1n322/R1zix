using System;

namespace RiskMate.MathEngine.Generators
{
    public static class NormalDistribution
    {
        [ThreadStatic]
        private static Random _random;

        public static void SetSeed(int seed)
        {
            _random = new Random(seed);
        }

        public static double NextDouble()
        {
            if (_random == null) _random = Random.Shared;
            return _random.NextDouble();
        }

        public static double Sample()
        {
            if (_random == null) _random = Random.Shared;
            
            double u1 = 1.0 - _random.NextDouble(); 
            double u2 = 1.0 - _random.NextDouble();
            return Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Cos(2.0 * Math.PI * u2);
        }
    }
}
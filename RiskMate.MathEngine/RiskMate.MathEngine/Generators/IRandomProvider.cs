namespace RiskMate.MathEngine.Generators
{
    public interface IRandomProvider
    {
        double NextDouble();
        int Next(int maxValue);
        double SampleNormal();
        IRandomProvider Spawn(int seedOffset);
    }
}

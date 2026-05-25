using System.Collections.Generic;

namespace RiskMate.MathEngine.Models
{
    public class SimulationResult
    {
        public double ExpectedPrice { get; set; }
        public double ValueAtRisk { get; set; }
        public double ConditionalValueAtRisk { get; set; }
        public double Volatility { get; set; }
        
        public List<ChartPointData> ChartPoints { get; set; } = new();
        public List<HistogramBinData> HistogramBins { get; set; } = new();
    }

    public class ChartPointData
    {
        public string DayLabel { get; set; } = string.Empty;
        public double ExpectedPrice { get; set; }
        public double LowerBound { get; set; }
        public double UpperBound { get; set; }
    }

    public class HistogramBinData
    {
        public string BinRange { get; set; } = string.Empty;
        public int Frequency { get; set; }
    }
}
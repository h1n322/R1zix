using System;
using System.Collections.Generic;
using RiskMate.MathEngine.Options;

namespace RiskMate.MathEngine.Models
{
    public class SimulationResult
    {
        public double ExpectedPrice { get; set; }
        public double ValueAtRisk { get; set; }
        public double ConditionalValueAtRisk { get; set; }
        public double Volatility { get; set; }
        public double SharpeRatio { get; set; }
        public double MaxDrawdown { get; set; }
        
        public List<ChartPointData> ChartPoints { get; set; } = new();
        public List<HistogramBinData> HistogramBins { get; set; } = new();
        
        public HedgingSuggestion? Hedging { get; set; }
    }

    public class ChartPointData
    {
        public DateTime Date { get; set; }
        public double? History { get; set; }
        public double? Forecast { get; set; }
        public double? Actual { get; set; }
        public double? LowerBound { get; set; }
        public double? UpperBound { get; set; }
    }

    public class HistogramBinData
    {
        public double MinValue { get; set; }
        public double MaxValue { get; set; }
        public int Frequency { get; set; }
    }
}

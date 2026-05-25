using System.Collections.Generic;

namespace RiskMate.MathEngine.Models
{
    public class BacktestResult
    {
        public int TotalTestedDays { get; set; }
        public int ExpectedBreaches { get; set; }
        public int ActualBreaches { get; set; }
        public double BreachRate { get; set; }
        
        public double AveragePredictedCVaR { get; set; } 
        public double AverageActualBreachReturn { get; set; } 
        public double CVaRDiscrepancy { get; set; }       
        
        public bool IsModelAccurate { get; set; }
        public List<BacktestDay> DailyResults { get; set; } = new();
    }

    public class BacktestDay
    {
        public double ActualReturn { get; set; }
        public double PredictedVaR { get; set; }
        public double PredictedCVaR { get; set; } 
        public bool IsBreach { get; set; }
    }
}
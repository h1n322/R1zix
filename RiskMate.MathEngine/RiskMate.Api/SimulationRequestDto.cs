namespace RiskMate.Api.DTOs
{
    public class SimulationRequestDto
    {
        public string Ticker { get; set; } = "AAPL";
        public string Algorithm { get; set; } = "gbm";
        public int SimulationsCount { get; set; } = 1000;
        public int Horizon { get; set; } = 30;
        public string Scenario { get; set; } = "Base";
        public double ConfidenceLevel { get; set; } = 0.95; // Наші 90%, 95% або 99%
    }
}
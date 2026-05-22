using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RiskMate.Api.Models
{
    public class Portfolio
    {
        public int Id { get; set; }
        
        // Зв'язок із користувачем
        public int UserId { get; set; }
        [JsonIgnore]
        public User? User { get; set; }

        // Метадані симуляції
        public string Tickers { get; set; } = string.Empty;
        public string Algorithm { get; set; } = string.Empty;
        public int SimulationsCount { get; set; }
        public int Horizon { get; set; }
        public string Scenario { get; set; } = string.Empty;

        // Метрики ризику
        public decimal ExpectedPrice { get; set; }
        public decimal ValueAtRisk { get; set; }      
        public decimal ConditionalValueAtRisk { get; set; } 
        public decimal Volatility { get; set; }
        public decimal SharpeRatio { get; set; }      
        public decimal MaxDrawdown { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ==========================================
        // ООП ЗВ'ЯЗКИ (Колекції підлеглих об'єктів)
        // ==========================================
        public List<ChartPoint> ChartPoints { get; set; } = [];
        public List<AssetDetail> AssetDetails { get; set; } = [];
        public List<HistogramBin> HistogramBins { get; set; } = [];
    }
}
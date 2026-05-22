using System.Text.Json.Serialization;

namespace RiskMate.Api.Models
{
    public class ChartPoint
    {
        public int Id { get; set; }
        
        public int PortfolioId { get; set; }
        [JsonIgnore] 
        public Portfolio? Portfolio { get; set; }

        public string DateLabel { get; set; } = string.Empty; // Наприклад "Day 1" або конкретна дата
        public decimal ExpectedPrice { get; set; }
        public decimal LowerBound { get; set; } // Для довірчого інтервалу
        public decimal UpperBound { get; set; }
    }
}
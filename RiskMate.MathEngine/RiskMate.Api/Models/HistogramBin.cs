using System.Text.Json.Serialization;

namespace RiskMate.Api.Models
{
    public class HistogramBin
    {
        public int Id { get; set; }

        public int PortfolioId { get; set; }
        [JsonIgnore]
        public Portfolio? Portfolio { get; set; }

        public string BinRange { get; set; } = string.Empty;
        public int Frequency { get; set; } 
    }
}
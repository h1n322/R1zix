using System.Text.Json.Serialization;

namespace RiskMate.Api.Models
{
    public class AssetDetail
    {
        public int Id { get; set; }
        
        public int PortfolioId { get; set; }
        [JsonIgnore]
        public Portfolio? Portfolio { get; set; }

        public string Ticker { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Sector { get; set; } = string.Empty;
        public decimal CurrentPrice { get; set; }
    }
}
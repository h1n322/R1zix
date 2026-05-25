using System.Text.Json;

namespace RiskMate.Api.Services
{
    public class YahooFinanceService
    {
        private readonly HttpClient _httpClient;

        // Використовуємо Dependency Injection для HttpClient
        public YahooFinanceService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        /// <summary>
        /// Завантажує історичні ціни закриття (Close) для заданого тикера.
        /// </summary>
        /// <param name="ticker">Наприклад, "AAPL"</param>
        /// <param name="range">Період: "1y", "2y", "5y", "max"</param>
        public async Task<List<double>> GetHistoricalPricesAsync(string ticker, string range = "5y")
        {
            // Публічний API Yahoo Finance, який повертає дані у форматі JSON
            var url = $"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range={range}";
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync();
            
            // Використовуємо JsonDocument для швидкого парсингу без створення зайвих DTO класів
            using var document = JsonDocument.Parse(jsonString);
            
            var root = document.RootElement;
            var result = root.GetProperty("chart").GetProperty("result")[0];
            
            // Дістаємо масив цін закриття
            var closePrices = result.GetProperty("indicators").GetProperty("quote")[0].GetProperty("close");

            var prices = new List<double>();
            
            foreach (var priceElement in closePrices.EnumerateArray())
            {
                // Додаємо тільки валідні числа (іноді Yahoo повертає null для вихідних/свят)
                if (priceElement.ValueKind == JsonValueKind.Number)
                {
                    prices.Add(priceElement.GetDouble());
                }
            }

            return prices;
        }
    }
}
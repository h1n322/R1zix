using System.Text;
using System.Text.Json;
using RiskMate.MathEngine.Models;
using RiskMate.Api.DTOs;

namespace RiskMate.Api.Services
{
    public class AiAnalyticsService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public AiAnalyticsService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["GeminiApiKey"] ?? "";
        }

        public async Task<string> GenerateRiskSummaryAsync(string ticker, SimulationResult result, List<NewsItemDto> news)
        {
            if (string.IsNullOrEmpty(_apiKey) || _apiKey == "YOUR_GEMINI_API_KEY")
            {
                return "Gemini API ключ не налаштовано. AI-аналітика тимчасово недоступна.";
            }

            try
            {
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
                
                var newsStr = news != null && news.Any() 
                    ? string.Join("; ", news.Take(3).Select(n => n.Title)) 
                    : "Свіжих новин немає.";

                var prompt = $@"
Ти - професійний фінансовий аналітик. Користувач аналізує актив {ticker}.
Ось результати математичної симуляції Монте-Карло:
- Очікувана ціна: ${result.ExpectedPrice:F2}
- Value at Risk (VaR): ${result.ValueAtRisk:F2}
- Волатильність: {result.Volatility * 100:F2}%
Останні новини: {newsStr}

Напиши короткий висновок (максимум 2-3 речення) українською мовою. Зверни увагу на рівень ризику (VaR) та загальний настрій новин. Не пиши вступних фраз, одразу суть.
";
                var requestBody = new
                {
                    contents = new[]
                    {
                        new { parts = new[] { new { text = prompt } } }
                    }
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(url, content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(responseString);
                    var aiText = doc.RootElement
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString();
                    
                    return aiText?.Trim() ?? "Не вдалося згенерувати висновок.";
                }

                return $"Помилка API: {response.StatusCode}";
            }
            catch (Exception ex)
            {
                return "AI-сервіс наразі недоступний через помилку мережі.";
            }
        }
    }
}

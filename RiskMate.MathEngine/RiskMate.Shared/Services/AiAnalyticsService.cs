using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;
using RiskMate.MathEngine.Models;
using RiskMate.Api.DTOs;
using RiskMate.Shared.Settings;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System;

namespace RiskMate.Api.Services
{
    public class AiAnalyticsService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public AiAnalyticsService(HttpClient httpClient, IOptions<RiskMateSettings> settings)
        {
            _httpClient = httpClient;
            _apiKey = settings.Value.GeminiApiKey ?? "";
        }

        public async Task<string> GenerateRiskSummaryAsync(string ticker, SimulationResult result, List<NewsItemDto> news, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(_apiKey) || _apiKey == "YOUR_GEMINI_API_KEY")
            {
                return GenerateFallbackSummary(ticker, result);
            }
            var modelsToTry = new[] { "gemini-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro" };
            var cleanKey = _apiKey.Trim();
            
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

            var contentString = JsonSerializer.Serialize(requestBody);
            
            var errors = new List<string>();

            // Встановлюємо таймаут не більше 5 секунд на виклики AI
            using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            foreach (var modelName in modelsToTry)
            {
                try
                {
                    var url = $"https://generativelanguage.googleapis.com/v1beta/models/{modelName}:generateContent";
                    
                    var request = new HttpRequestMessage(HttpMethod.Post, url);
                    request.Headers.Add("X-goog-api-key", cleanKey);
                    request.Content = new StringContent(contentString, Encoding.UTF8, "application/json");
                    
                    var response = await _httpClient.SendAsync(request, linkedCts.Token);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseString = await response.Content.ReadAsStringAsync(linkedCts.Token);
                        using var doc = JsonDocument.Parse(responseString);
                        var aiText = doc.RootElement
                            .GetProperty("candidates")[0]
                            .GetProperty("content")
                            .GetProperty("parts")[0]
                            .GetProperty("text")
                            .GetString();
                        
                        return aiText?.Trim() ?? GenerateFallbackSummary(ticker, result);
                    }

                    var errorBody = await response.Content.ReadAsStringAsync(linkedCts.Token);
                    errors.Add($"[{modelName}: {response.StatusCode} {errorBody}]");
                    
                    if (response.StatusCode != System.Net.HttpStatusCode.NotFound && response.StatusCode != System.Net.HttpStatusCode.ServiceUnavailable)
                    {
                        break;
                    }
                }
                catch (OperationCanceledException)
                {
                    // Таймаут або запит клієнта скасовано
                    break;
                }
                catch (Exception ex)
                {
                    errors.Add($"[{modelName}: Network Error {ex.Message}]");
                }
            }
            
            return GenerateFallbackSummary(ticker, result);
        }

        private static string GenerateFallbackSummary(string ticker, SimulationResult result)
        {
            var riskLevel = result.ValueAtRisk > (result.ExpectedPrice * 0.15) ? "підвищений" : "помірний";
            return $"За результатами моделювання акції {ticker}, розрахункова очікувана ціна становить ${result.ExpectedPrice:F2} з прогнозованим рівнем ризику VaR ${result.ValueAtRisk:F2} (волатильність {result.Volatility * 100:F1}%). Зафіксовано {riskLevel} ступінь невизначеності на обраному часовому горизонті; рекомендується диверсифікація портфеля.";
        }
    }
}

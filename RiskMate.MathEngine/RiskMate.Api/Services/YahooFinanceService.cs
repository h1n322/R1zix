using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace RiskMate.Api.Services
{
    public class HistoricalPriceDto
    {
        public DateTime Date { get; set; }
        public double Close { get; set; }
    }

    public class YahooFinanceService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;

        public YahooFinanceService(HttpClient httpClient, IMemoryCache cache)
        {
            _httpClient = httpClient;
            _cache = cache;
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "RiskMate C# Backend");
        }

        public async Task<List<HistoricalPriceDto>> GetHistoricalDataAsync(string ticker, int lookbackYears = 5)
        {
            var cacheKey = $"history_{ticker}_{lookbackYears}";
            
            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(2);

                // Звертаємось до Python Data Gateway замість Yahoo!
                var url = $"http://python-ml:8000/api/history/{ticker}?lookback={lookbackYears}";
                
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var jsonString = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<List<HistoricalPriceDto>>(jsonString, options);

                return data ?? new List<HistoricalPriceDto>();
            });
        }

        public async Task<List<double>> GetHistoricalPricesAsync(string ticker, int lookbackYears = 5)
        {
            var data = await GetHistoricalDataAsync(ticker, lookbackYears);
            return data.Select(d => d.Close).ToList();
        }

        public async Task<List<DTOs.NewsItemDto>> GetAssetNewsAsync(string ticker, int count = 5)
        {
            var cacheKey = $"news_{ticker}_{count}";

            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30);
                
                try
                {
                    // Звертаємось до Python Data Gateway
                    var url = $"http://python-ml:8000/api/news/{ticker}?limit={count}";
                    var response = await _httpClient.GetAsync(url);
                    response.EnsureSuccessStatusCode();

                    var jsonString = await response.Content.ReadAsStringAsync();
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var data = JsonSerializer.Deserialize<List<DTOs.NewsItemDto>>(jsonString, options);
                    
                    return data ?? new List<DTOs.NewsItemDto>();
                }
                catch (Exception)
                {
                    return new List<DTOs.NewsItemDto>();
                }
            });
        }
    }
}
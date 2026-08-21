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
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        }

        public async Task<List<HistoricalPriceDto>> GetHistoricalDataAsync(string ticker)
        {
            var cacheKey = $"history_{ticker}";
            
            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                // Зберігаємо дані в кеші на 2 години
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(2);
                
                DateTime endDate = DateTime.UtcNow;
                DateTime startDate = endDate.AddYears(-3);
                long period1 = new DateTimeOffset(startDate).ToUnixTimeSeconds();
                long period2 = new DateTimeOffset(endDate).ToUnixTimeSeconds();

                var url = $"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&period1={period1}&period2={period2}";
                
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var jsonString = await response.Content.ReadAsStringAsync();
                
                using var document = JsonDocument.Parse(jsonString);
                var root = document.RootElement;
                var result = root.GetProperty("chart").GetProperty("result")[0];
                
                var timestamps = result.GetProperty("timestamp");
                var closePrices = result.GetProperty("indicators").GetProperty("quote")[0].GetProperty("close");

                var list = new List<HistoricalPriceDto>();
                var timestampEnumerator = timestamps.EnumerateArray();
                var priceEnumerator = closePrices.EnumerateArray();

                while (timestampEnumerator.MoveNext() && priceEnumerator.MoveNext())
                {
                    var tEl = timestampEnumerator.Current;
                    var pEl = priceEnumerator.Current;

                    if (pEl.ValueKind == JsonValueKind.Number)
                    {
                        long unixTime = tEl.GetInt64();
                        DateTime dt = DateTimeOffset.FromUnixTimeSeconds(unixTime).UtcDateTime;
                        list.Add(new HistoricalPriceDto
                        {
                            Date = dt,
                            Close = pEl.GetDouble()
                        });
                    }
                }

                return list;
            });
        }

        public async Task<List<double>> GetHistoricalPricesAsync(string ticker)
        {
            var data = await GetHistoricalDataAsync(ticker);
            return data.Select(d => d.Close).ToList();
        }

        public async Task<List<DTOs.NewsItemDto>> GetAssetNewsAsync(string ticker, int count = 5)
        {
            var cacheKey = $"news_{ticker}_{count}";

            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30); // Новини кешуємо на 30 хвилин
                
                var list = new List<DTOs.NewsItemDto>();
                try
                {
                    var url = $"https://query2.finance.yahoo.com/v1/finance/search?q={ticker}&newsCount={count}";
                    var response = await _httpClient.GetAsync(url);
                    response.EnsureSuccessStatusCode();

                    var jsonString = await response.Content.ReadAsStringAsync();
                    using var document = JsonDocument.Parse(jsonString);
                    
                    if (document.RootElement.TryGetProperty("news", out var newsArray) && newsArray.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in newsArray.EnumerateArray())
                        {
                            var newsItem = new DTOs.NewsItemDto();
                            
                            if (item.TryGetProperty("title", out var titleProp)) newsItem.Title = titleProp.GetString() ?? "";
                            if (item.TryGetProperty("link", out var linkProp)) newsItem.Link = linkProp.GetString() ?? "";
                            if (item.TryGetProperty("publisher", out var pubProp)) newsItem.Publisher = pubProp.GetString() ?? "";
                            if (item.TryGetProperty("providerPublishTime", out var timeProp) && timeProp.ValueKind == JsonValueKind.Number)
                            {
                                newsItem.Timestamp = timeProp.GetInt64();
                            }
                            
                            list.Add(newsItem);
                        }
                    }
                }
                catch (Exception)
                {
                    // У разі помилки просто повертаємо порожній список, щоб не ламати симуляцію
                }
                
                return list;
            });
        }
    }
}
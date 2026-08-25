using Microsoft.AspNetCore.Mvc;
using RiskMate.Api.Services;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;

namespace RiskMate.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarketController : ControllerBase
    {
        private readonly YahooFinanceService _yahooFinanceService;

        public MarketController(YahooFinanceService yahooFinanceService)
        {
            _yahooFinanceService = yahooFinanceService;
        }

        [HttpGet("overview")]
        [Route("/api/market-overview")] // Додатковий роут, щоб відповідати шляху
        public async Task<IActionResult> GetMarketOverview()
        {
            var tickers = new[] { "SPY", "QQQ", "BTC-USD", "AAPL", "MSFT", "NVDA", "TSLA" };
            var result = new List<object>();

            // Робимо запити паралельно
            var tasks = tickers.Select(async ticker =>
            {
                try
                {
                    // Беремо історію за останні 5 днів, але наш GetHistoricalPricesAsync повертає за 3 роки.
                    // Ми можемо взяти останні 2 ціни.
                    var prices = await _yahooFinanceService.GetHistoricalPricesAsync(ticker, 1);
                    if (prices != null && prices.Count >= 2)
                    {
                        var current = prices.Last();
                        var prev = prices[prices.Count - 2];
                        var changePct = ((current - prev) / prev) * 100;
                        return new
                        {
                            ticker = ticker,
                            price = current.ToString("N2"),
                            change = (changePct > 0 ? "+" : "") + changePct.ToString("F2") + "%",
                            isUp = changePct >= 0
                        };
                    }
                }
                catch (Exception)
                {
                    // Ігноруємо помилки для окремих тикерів, щоб інші завантажилися
                }
                return null;
            });

            var overview = await Task.WhenAll(tasks);
            return Ok(overview.Where(x => x != null));
        }
    }
}

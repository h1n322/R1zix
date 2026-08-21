using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RiskMate.Api.DTOs;
using RiskMate.Api.Services;
using RiskMate.MathEngine; // Підключаємо наш математичний рушій
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Simulators;

namespace RiskMate.Api.Controllers
{
    //[Authorize] 
    [ApiController]
    [Route("api/[controller]")]
    public class SimulationController : ControllerBase
    {
        private readonly YahooFinanceService _yahooFinanceService;
        private readonly RiskEngine _riskEngine;
        private readonly BacktestSimulator _backtestSimulator;
        private readonly PdfReportService _pdfReportService;
        private readonly AiAnalyticsService _aiAnalyticsService;
        private readonly ILogger<SimulationController> _logger;

        public SimulationController(
            YahooFinanceService yahooFinanceService,
            RiskEngine riskEngine,
            BacktestSimulator backtestSimulator,
            PdfReportService pdfReportService,
            AiAnalyticsService aiAnalyticsService,
            ILogger<SimulationController> logger)
        {
            _yahooFinanceService = yahooFinanceService;
            _riskEngine = riskEngine;
            _backtestSimulator = backtestSimulator;
            _pdfReportService = pdfReportService;
            _aiAnalyticsService = aiAnalyticsService;
            _logger = logger;
        }

        [HttpPost("run")]
        public async Task<IActionResult> RunSimulation([FromBody] SimulationRequestDto dto)
        {
            try
            {
                bool isBacktest = dto.Algorithm?.ToLowerInvariant() == "backtest" || dto.IsBacktest;
                var algorithm = ParseAlgorithm(dto.Algorithm);
                
                if (algorithm is null)
                {
                    return BadRequest(new { Message = $"Невідомий алгоритм: {dto.Algorithm}. Допустимі: gbm, historical, merton, garch, backtest" });
                }

                var scenario = ParseScenario(dto.Scenario);

                List<HistoricalPriceDto> historicalDataDto = null;
                try
                {
                    historicalDataDto = await _yahooFinanceService.GetHistoricalDataAsync(dto.Ticker);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Помилка завантаження актуальних котирувань з Yahoo Finance для тикера {Ticker}", dto.Ticker);
                    return StatusCode(502, new { Message = "Помилка завантаження актуальних котирувань з провайдера даних." });
                }

                if (historicalDataDto == null || historicalDataDto.Count < 10)
                {
                    return BadRequest(new { Message = $"Не вдалося отримати достатньо історичних даних для тикера {dto.Ticker}" });
                }

                var priceDataPoints = historicalDataDto.Select(h => new PriceDataPoint
                {
                    Date = h.Date,
                    Price = h.Close
                }).ToList();

                var simulationResult = _riskEngine.RunSimulation(
                    priceDataPoints,
                    algorithm.Value,
                    dto.SimulationsCount,
                    dto.Horizon,
                    scenario,
                    dto.ConfidenceLevel,
                    dto.CustomShockPercentage ?? 0,
                    isBacktest
                );

                var news = await _yahooFinanceService.GetAssetNewsAsync(dto.Ticker);
                
                var aiSummary = await _aiAnalyticsService.GenerateRiskSummaryAsync(dto.Ticker, simulationResult, news);

                return Ok(new {
                    ExpectedPrice = simulationResult.ExpectedPrice,
                    ValueAtRisk = simulationResult.ValueAtRisk,
                    ConditionalValueAtRisk = simulationResult.ConditionalValueAtRisk,
                    Volatility = simulationResult.Volatility,
                    ChartPoints = simulationResult.ChartPoints,
                    HistogramBins = simulationResult.HistogramBins,
                    Hedging = simulationResult.Hedging,
                    News = news,
                    AiSummary = aiSummary
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Помилка під час обчислення моделі для тикера {Ticker}", dto.Ticker);
                return StatusCode(500, new { Message = "Внутрішня помилка сервера під час обчислення моделі." });
            }
        }

        [HttpPost("backtest")]
        [HttpPost("report")]
        public async Task<IActionResult> GenerateReport([FromBody] SimulationRequestDto dto)
        {
            try
            {
                bool isBacktest = dto.Algorithm?.ToLowerInvariant() == "backtest" || dto.IsBacktest;
                var algorithm = ParseAlgorithm(dto.Algorithm);
                
                if (algorithm is null) return BadRequest(new { Message = "Невідомий алгоритм" });
                var scenario = ParseScenario(dto.Scenario);

                var historicalDataDto = await _yahooFinanceService.GetHistoricalDataAsync(dto.Ticker);
                if (historicalDataDto == null || historicalDataDto.Count < 10)
                    return BadRequest(new { Message = "Не вдалося отримати історичні дані." });

                var priceDataPoints = historicalDataDto.Select(h => new PriceDataPoint { Date = h.Date, Price = h.Close }).ToList();

                var simulationResult = _riskEngine.RunSimulation(
                    priceDataPoints, algorithm.Value, dto.SimulationsCount, dto.Horizon, scenario, dto.ConfidenceLevel, dto.CustomShockPercentage ?? 0, isBacktest);

                var news = await _yahooFinanceService.GetAssetNewsAsync(dto.Ticker);
                var aiSummary = await _aiAnalyticsService.GenerateRiskSummaryAsync(dto.Ticker, simulationResult, news);

                var pdfBytes = _pdfReportService.GenerateReport(dto, simulationResult, aiSummary);
                return File(pdfBytes, "application/pdf", $"RiskMate_Report_{dto.Ticker}.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Помилка під час генерації PDF для тикера {Ticker}", dto.Ticker);
                return StatusCode(500, new { Message = "Помилка генерації звіту." });
            }
        }
        public async Task<IActionResult> RunBacktest([FromBody] BacktestRequestDto dto)
        {
            try
            {
                List<double> historicalPrices = null;
                try
                {
                    historicalPrices = await _yahooFinanceService.GetHistoricalPricesAsync(dto.Ticker);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Помилка завантаження актуальних котирувань з Yahoo Finance для тикера {Ticker}", dto.Ticker);
                    return StatusCode(502, new { Message = "Помилка завантаження актуальних котирувань з провайдера даних." });
                }

                if (historicalPrices == null || historicalPrices.Count <= dto.WindowSize)
                {
                    return BadRequest(new { Message = $"Не вдалося отримати достатньо історичних даних для тикера {dto.Ticker}. Потрібно щонайменше {dto.WindowSize + 1} точок даних." });
                }

                var backtestSimulator = new BacktestSimulator();
                var backtestResult = backtestSimulator.RunHistoricalRiskBacktest(historicalPrices, dto.WindowSize, dto.ConfidenceLevel);

                return Ok(backtestResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Помилка під час обчислення бектесту для тикера {Ticker}", dto.Ticker);
                return StatusCode(500, new { Message = "Внутрішня помилка сервера під час обчислення бектесту." });
            }
        }

        private static SimulationAlgorithm? ParseAlgorithm(string algorithm)
        {
            return algorithm?.ToLowerInvariant() switch
            {
                "gbm" or "montecarlo" or "monte_carlo" or "backtest" => SimulationAlgorithm.Gbm,
                "historical" => SimulationAlgorithm.Historical,
                "merton" => SimulationAlgorithm.Merton,
                "garch" => SimulationAlgorithm.Garch,
                _ => null
            };
        }

        private static StressScenario? ParseScenario(string scenario)
        {
            if (string.IsNullOrWhiteSpace(scenario)) return null;

            return scenario.ToLowerInvariant() switch
            {
                "base" or "none" or "default" => null,
                "covid" => StressScenario.Covid19Crash,
                "dotcom" => StressScenario.DotComBubble00,
                "crisis08" or "2008" => StressScenario.FinancialCrisis08,
                "blackmonday" => StressScenario.BlackMonday87,
                "war2022" => StressScenario.GeopoliticalShock22,
                "aibubble" => StressScenario.AIBubbleBurst,
                "flashcrash" => StressScenario.FlashCrash10,
                "custom" => StressScenario.CustomShock,
                _ => null
            };
        }
    }
}
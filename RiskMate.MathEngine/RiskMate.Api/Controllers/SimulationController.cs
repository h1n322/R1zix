using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RiskMate.Api.DTOs;
using RiskMate.Api.Services;
using RiskMate.MathEngine; // Підключаємо наш математичний рушій

namespace RiskMate.Api.Controllers
{
    [Authorize] // Захищаємо ендпоінт, щоб рахувати могли тільки авторизовані юзери
    [ApiController]
    [Route("api/[controller]")]
    public class SimulationController : ControllerBase
    {
        private readonly YahooFinanceService _yahooFinanceService;
        private readonly RiskEngine _riskEngine;

        // Впроваджуємо залежності через конструктор
        public SimulationController(YahooFinanceService yahooFinanceService)
        {
            _yahooFinanceService = yahooFinanceService;
            _riskEngine = new RiskEngine(); // Оскільки RiskEngine не має внутрішнього стану, можемо створювати його прямо тут
        }

        [HttpPost("run")]
        public async Task<IActionResult> RunSimulation([FromBody] SimulationRequestDto dto)
        {
            try
            {
                // 1. Завантажуємо реальну історію цін з Yahoo Finance (за останні 5 років для точної статистики)
                List<double> historicalPrices = await _yahooFinanceService.GetHistoricalPricesAsync(dto.Ticker, "5y");

                if (historicalPrices == null || historicalPrices.Count < 10)
                {
                    return BadRequest(new { Message = $"Не вдалося отримати достатньо історичних даних для тикера {dto.Ticker}" });
                }

                // 2. Запускаємо розрахунки в нашому квантовому рушії
                var simulationResult = _riskEngine.RunSimulation(
                    historicalPrices,
                    dto.Algorithm,
                    dto.SimulationsCount,
                    dto.Horizon,
                    dto.Scenario,
                    dto.ConfidenceLevel
                );

                // 3. Повертаємо чисті дані, які React Recharts зможе одразу намалювати
                return Ok(simulationResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Помилка під час обчислення моделі", Detail = ex.Message });
            }
        }
    }
}
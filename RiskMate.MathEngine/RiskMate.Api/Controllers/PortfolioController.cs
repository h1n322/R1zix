using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RiskMate.Api.Data;
using RiskMate.Api.Models;
using System.Security.Claims;
using RiskMate.Api.DTOs;

namespace RiskMate.Api.Controllers
{
    [Authorize] // Захищаємо весь контролер — доступ лише з дійсним Firebase JWT-токеном
    [ApiController]
    [Route("api/[controller]")]
    public class PortfolioController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PortfolioController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Ендпоінт для збереження симуляції
        [HttpPost]
        public async Task<IActionResult> CreatePortfolio([FromBody] PortfolioCreateDto dto)
        {
            // Витягуємо унікальний Firebase UID із розшифрованого токена
            var firebaseUid = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
            {
                return Unauthorized(new { Message = "Недійсний токен автентифікації" });
            }

            // Шукаємо нашого юзера в PostgreSQL за його Firebase UID
            var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);
            if (user == null)
            {
                return NotFound(new { Message = "Користувача не знайдено в системній базі даних" });
            }

            // Створюємо головний об'єкт архітектури (Aggregate Root)
            var portfolio = new Portfolio
            {
                UserId = user.Id, // Прив'язуємо до нашого внутрішнього Int ID
                Tickers = dto.Tickers,
                Algorithm = dto.Algorithm,
                SimulationsCount = dto.SimulationsCount,
                Horizon = dto.Horizon,
                Scenario = dto.Scenario,
                ExpectedPrice = dto.ExpectedPrice,
                ValueAtRisk = dto.ValueAtRisk,
                ConditionalValueAtRisk = dto.ConditionalValueAtRisk,
                Volatility = dto.Volatility,
                SharpeRatio = dto.SharpeRatio,
                MaxDrawdown = dto.MaxDrawdown,
                CreatedAt = DateTime.UtcNow
            };

            // Завдяки композиції в ООП, ми просто наповнюємо колекції всередині об'єкта
            foreach (var cp in dto.ChartPoints)
            {
                portfolio.ChartPoints.Add(new ChartPoint
                {
                    DateLabel = cp.DateLabel,
                    ExpectedPrice = cp.ExpectedPrice,
                    LowerBound = cp.LowerBound,
                    UpperBound = cp.UpperBound
                });
            }

            foreach (var ad in dto.AssetDetails)
            {
                portfolio.AssetDetails.Add(new AssetDetail
                {
                    Ticker = ad.Ticker,
                    CompanyName = ad.CompanyName,
                    Sector = ad.Sector,
                    CurrentPrice = ad.CurrentPrice
                });
            }

            foreach (var hb in dto.HistogramBins)
            {
                portfolio.HistogramBins.Add(new HistogramBin
                {
                    BinRange = hb.BinRange,
                    Frequency = hb.Frequency
                });
            }

            _context.Portfolios.Add(portfolio);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Розрахунок портфеля успішно збережено", PortfolioId = portfolio.Id });
        }

        [HttpGet]
        public async Task<IActionResult> GetMyPortfolios()
        {
            var firebaseUid = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);
            if (user == null) return NotFound();

            var portfolios = await _context.Portfolios
                .Where(p => p.UserId == user.Id)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(portfolios);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPortfolioById(int id)
        {
            var firebaseUid = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);
            if (user == null) return NotFound();

            var portfolio = await _context.Portfolios
                .Include(p => p.ChartPoints)
                .Include(p => p.AssetDetails)
                .Include(p => p.HistogramBins)
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == user.Id);

            if (portfolio == null) return NotFound();

            return Ok(portfolio);
        }
    }
}
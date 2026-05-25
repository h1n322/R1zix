using Microsoft.EntityFrameworkCore;
using RiskMate.Api.Models;

namespace RiskMate.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Portfolio> Portfolios { get; set; }
        public DbSet<ChartPoint> ChartPoints { get; set; }
        public DbSet<AssetDetail> AssetDetails { get; set; }
        public DbSet<HistogramBin> HistogramBins { get; set; }
    }
}
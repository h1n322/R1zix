using System;
using System.Collections.Generic;
using System.Linq;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Calculators;
using RiskMate.MathEngine.Simulators;

namespace RiskMate.MathEngine
{
    public class RiskEngine
    {
        private readonly MonteCarloSimulator _monteCarlo = new();
        private readonly HistoricalSimulator _historical = new();
        private readonly StressTestSimulator _stressTest = new();
        private readonly MertonJumpSimulator _merton = new();
        private readonly GarchSimulator _garch = new();

        public SimulationResult RunSimulation(List<double> historicalPrices, string algorithm, int simulationsCount, int horizon, string scenario,double confidenceLevel = 0.95)
        {
            var returns = ReturnsCalculator.CalculateLogReturns(historicalPrices);
            double currentPrice = historicalPrices.Last();
            
            double meanReturn = returns.Average();
            double volatility = RiskCalculator.CalculateVolatility(returns);
            double drift = DriftCalculator.CalculateGbmDrift(meanReturn, volatility);

            var parameters = new AssetParameters
            {
                InitialPrice = currentPrice,
                MeanReturn = meanReturn,
                Volatility = volatility,
                Drift = drift
            };

            List<List<double>> paths;

            if (algorithm.ToLower() == "historical")
            {
                paths = _historical.Simulate(currentPrice, returns, simulationsCount, horizon);
            }
            else if (algorithm.ToLower() == "merton")
            {
                paths = _merton.Simulate(parameters, simulationsCount, horizon);
            }
            else if (algorithm.ToLower() == "garch")
            {
                paths = _garch.Simulate(parameters, simulationsCount, horizon);
            }
            else if (!string.IsNullOrEmpty(scenario) && scenario.ToLower() != "base" && scenario.ToLower() != "none" && scenario.ToLower() != "covid") 
            {
                // Если выбран кризисный сценарий (стресс-тест)
                var stressScenario = MapScenario(scenario);
                paths = _stressTest.Simulate(parameters, simulationsCount, horizon, stressScenario);
            }
            else
            {
                // По умолчанию — классический Geometric Brownian Motion (Монте-Карло)
                paths = _monteCarlo.Simulate(parameters, simulationsCount, horizon);
            }


            var result = new SimulationResult
            {
                ExpectedPrice = MetricsCalculator.CalculateExpectedPrice(paths),
                
                // Передаємо рівень довіри сюди:
                ValueAtRisk = MetricsCalculator.CalculateVaR(paths, confidenceLevel), 
                
                // І сюди:
                ConditionalValueAtRisk = MetricsCalculator.CalculateCVaR(paths, confidenceLevel), 
                
                Volatility = volatility * Math.Sqrt(252) 
            };

            for (int day = 0; day <= horizon; day++)
            {
                var dayPrices = paths.Select(p => p[day]).ToList();
                dayPrices.Sort();

                result.ChartPoints.Add(new ChartPointData
                {
                    DayLabel = $"День {day}",
                    ExpectedPrice = dayPrices.Average(),
                    LowerBound = dayPrices[(int)(simulationsCount * 0.05)], 
                    UpperBound = dayPrices[(int)(simulationsCount * 0.95)] 
                });
            }

            result.HistogramBins = GenerateHistogram(paths.Select(p => p.Last()).ToList());

            return result;
        }

        private StressScenario MapScenario(string scenario)
        {
            return scenario.ToLower() switch
            {
                "covid" => StressScenario.Covid19Crash,
                "dotcom" => StressScenario.DotComBubble00,
                "crisis08" => StressScenario.FinancialCrisis08,
                "blackmonday" => StressScenario.BlackMonday87,
                "war2022" => StressScenario.GeopoliticalShock22,
                "aibubble" => StressScenario.AIBubbleBurst,
                _ => StressScenario.CustomShock
            };
        }

        private List<HistogramBinData> GenerateHistogram(List<double> finalPrices, int binCount = 15)
        {
            var bins = new List<HistogramBinData>();
            double min = finalPrices.Min();
            double max = finalPrices.Max();
            double range = max - min;
            double binWidth = range / binCount;

            var counts = new int[binCount];
            foreach (var price in finalPrices)
            {
                int binIndex = (int)((price - min) / binWidth);
                if (binIndex >= binCount) binIndex = binCount - 1;
                if (binIndex < 0) binIndex = 0;
                counts[binIndex]++;
            }

            for (int i = 0; i < binCount; i++)
            {
                double binMin = min + (i * binWidth);
                double binMax = binMin + binWidth;
                bins.Add(new HistogramBinData
                {
                    BinRange = $"${Math.Round(binMin, 1)}-${Math.Round(binMax, 1)}",
                    Frequency = counts[i]
                });
            }

            return bins;
        }
    }
}
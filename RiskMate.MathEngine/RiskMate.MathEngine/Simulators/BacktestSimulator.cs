using System;
using System.Collections.Generic;
using System.Linq;
using RiskMate.MathEngine.Models;
using RiskMate.MathEngine.Calculators;

namespace RiskMate.MathEngine.Simulators
{
    public class BacktestSimulator
    {
        public BacktestResult RunHistoricalRiskBacktest(List<double> prices, int windowSize = 252, double confidenceLevel = 0.95)
        {
            var returns = ReturnsCalculator.CalculateLogReturns(prices).ToArray();
            var result = new BacktestResult();
            
            if (returns.Length <= windowSize) return result;

            int percentileIndex = (int)Math.Floor(windowSize * (1.0 - confidenceLevel));

            var predictedCVaRsOnBreachDays = new List<double>();
            var actualReturnsOnBreachDays = new List<double>();

            // Перевикористовуємо один буфер замість створення нових списків на кожну ітерацію
            var window = new double[windowSize];

            for (int i = windowSize; i < returns.Length; i++)
            {
                Array.Copy(returns, i - windowSize, window, 0, windowSize);
                Array.Sort(window);

                double predictedVaR = window[percentileIndex];

                double predictedCVaR = percentileIndex > 0
                    ? window.Take(percentileIndex).Average()
                    : predictedVaR;

                double actualReturn = returns[i];
                bool isBreach = actualReturn < predictedVaR;

                result.DailyResults.Add(new BacktestDay
                {
                    ActualReturn = actualReturn,
                    PredictedVaR = predictedVaR,
                    PredictedCVaR = predictedCVaR,
                    IsBreach = isBreach
                });

                if (isBreach)
                {
                    result.ActualBreaches++;
                    // Фіксуємо, що прогнозував CVaR і що сталося насправді в цей чорний день
                    predictedCVaRsOnBreachDays.Add(predictedCVaR);
                    actualReturnsOnBreachDays.Add(actualReturn);
                }
            }

            result.TotalTestedDays = returns.Length - windowSize;
            result.ExpectedBreaches = (int)Math.Round(result.TotalTestedDays * (1.0 - confidenceLevel));
            result.BreachRate = (double)result.ActualBreaches / result.TotalTestedDays;

            if (result.ActualBreaches > 0)
            {
                result.AveragePredictedCVaR = predictedCVaRsOnBreachDays.Average();
                result.AverageActualBreachReturn = actualReturnsOnBreachDays.Average();
                
                result.CVaRDiscrepancy = result.AverageActualBreachReturn - result.AveragePredictedCVaR;
            }

            bool breachCountOk = result.ActualBreaches <= (result.ExpectedBreaches * 1.5);
            bool cvarOk = result.CVaRDiscrepancy >= -0.01; 

            result.IsModelAccurate = breachCountOk && cvarOk;

            return result;
        }
    }
}
using System.Collections.Generic;
using System.Linq;

namespace RiskMate.MathEngine.Calculators
{
    public static class MatrixCalculator
    {
        /// <summary>
        /// Рахує коваріацію між двома масивами дохідностей.
        /// </summary>
        public static double CalculateCovariance(List<double> returns1, List<double> returns2)
        {
            if (returns1.Count != returns2.Count || returns1.Count <= 1) return 0;

            double mean1 = returns1.Average();
            double mean2 = returns2.Average();
            double sum = 0;

            for (int i = 0; i < returns1.Count; i++)
            {
                sum += (returns1[i] - mean1) * (returns2[i] - mean2);
            }

            return sum / (returns1.Count - 1);
        }
    }
}
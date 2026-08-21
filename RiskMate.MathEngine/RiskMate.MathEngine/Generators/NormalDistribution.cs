using System;

namespace RiskMate.MathEngine.Generators
{
    public static class NormalDistribution
    {
        /// <summary>
        /// Генерує випадкове число зі стандартного нормального розподілу (Середнє = 0, Відхилення = 1)
        /// </summary>
        public static double Sample()
        {
            // Генеруємо два числа від 0 до 1 (не включаючи 0, щоб уникнути помилки логарифму)
            double u1 = 1.0 - Random.Shared.NextDouble(); 
            double u2 = 1.0 - Random.Shared.NextDouble();
            
            // Застосовуємо перетворення Бокса-Мюллера
            return Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Cos(2.0 * Math.PI * u2);
        }
    }
}
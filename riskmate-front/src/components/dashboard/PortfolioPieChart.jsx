import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../dashboard/css/PortfolioPieChart.module.css';

// ⚡️ ВИПРАВЛЕНО: Використовуємо ЄДИНУ фірмову палітру RiskMate для всіх кругових діаграм
const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#eab308', '#06b6d4'];

const PortfolioPieChart = ({ ticker }) => {
  const tickers = ticker.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
  
  if (tickers.length <= 1) return null;

  // Рахуємо рівні частки (Equal Weight Portfolio)
  const data = tickers.map(t => ({
    name: t,
    value: 100 / tickers.length
  }));

  return (
    <div className={styles.cardContainer}>
      {/* ⚡️ ВИПРАВЛЕНО: Додано уточнення про рівні частки */}
      <h3 className={styles.title}>Базовий розподіл (Рівні частки)</h3>
      
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{ outline: 'none' }} // Прибираємо синю рамку браузера при кліку
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value.toFixed(1)}%`, 'Частка']}
              contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #1F2937', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#e2e8f0', fontWeight: '500' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              wrapperStyle={{ color: '#8E8E93' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioPieChart;
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PortfolioPieChart = ({ ticker }) => {
  const tickers = ticker.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
  
  if (tickers.length <= 1) return null;

  const data = tickers.map(t => ({
    name: t,
    value: 100 / tickers.length
  }));

  const COLORS = ['#0A84FF', '#34C759', '#FF9F0A', '#FF3B30', '#BF5AF2', '#30D158'];

  return (
    <div className="card" style={{ width: '100%', padding: '24px', marginBottom: '60px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#fff', textAlign: 'center' }}>Розподіл активів у портфелі</h3>
      
      {/* Спеціальний контейнер-обгортка, щоб графік не вилазив за краї */}
      <div style={{ width: '100%', height: 320 }}>
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `${value.toFixed(1)}%`}
              contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #38383A', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            {/* Явно вказуємо висоту і позицію для легенди */}
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioPieChart;
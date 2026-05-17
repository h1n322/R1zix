import React from 'react';
// 🔥 ДОДАНО: ReferenceLine для відображення межі Expected Price
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import styles from '../dashboard/css/DistributionChart.module.css';

const DistributionChart = ({ data, expectedPrice }) => {
  // Діагностику прибрано для чистоти продакшену
  
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>📊 Очікування даних симуляції для побудови розподілу...</p>
      </div>
    );
  }

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.title}>
        Розподіл ймовірностей (Дзвін Монте-Карло)
      </h3>
      
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis 
              dataKey="price" 
              stroke="#8E8E93" 
              tick={{fill: '#8E8E93', fontSize: 12}} 
              tickFormatter={(val) => `$${val}`} 
              minTickGap={20} 
            />
            <YAxis stroke="#8E8E93" tick={{fill: '#8E8E93', fontSize: 12}} />
            
            <Tooltip
              contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #38383A', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => [`${value} сценаріїв`, 'Кількість']}
              labelFormatter={(label) => `Ціна: $${label}`}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} // Легке підсвічування колонки при наведенні
            />
            
            {/* 🔥 МАГІЯ ТУТ: Візуальна лінія очікуваної ціни */}
            {expectedPrice && (
              <ReferenceLine 
                x={expectedPrice} 
                stroke="#3B82F6" 
                strokeDasharray="4 4" 
                label={{ position: 'top', value: 'Очікувана ціна', fill: '#3B82F6', fontSize: 12 }} 
              />
            )}

            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  /* 🔥 Фірмові кольори RiskMate з прозорістю */
                  fill={entry.price < expectedPrice ? 'rgba(239, 68, 68, 0.85)' : 'rgba(16, 185, 129, 0.85)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <p className={styles.footerText}>
        * <span className={styles.redText}>Червона зона</span> — сценарії нижче очікуваної прибутковості (ризик).{' '}
        <span className={styles.greenText}>Зелена зона</span> — оптимістичні сценарії.
      </p>
    </div>
  );
};

export default DistributionChart;
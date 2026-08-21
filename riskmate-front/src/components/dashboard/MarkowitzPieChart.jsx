import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../dashboard/css/MarkowitzPieChart.module.css';
const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#eab308', '#06b6d4'];

const MarkowitzPieChart = ({ allocations }) => {
  if (!allocations || Object.keys(allocations).length === 0) return null;

  const data = Object.keys(allocations).map((ticker) => ({
    name: ticker,
    value: allocations[ticker]
  })).filter(item => item.value > 0);

  return (
    <div className={styles.cardContainer}>
  <h3 className={styles.title}>Розподіл портфеля за Теорією Марковіца</h3>
  <p className={styles.subtitle}>
    Програма розрахувала ці частки для максимізації дохідності при мінімальному ризику.
  </p>
  
  {/* Додаємо клас-маркер .pieChartContainer для CSS */}
  <div className={`${styles.chartWrapper} ${styles.pieChartContainer}`} style={{ width: '100%', minWidth: 0, minHeight: '300px', height: '300px' }}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}  
          outerRadius={115} 
          paddingAngle={5}  
          dataKey="value"   
          label={({ name, value }) => `${name} ${value}%`} 
          
          stroke="none"     
          labelLine={true} 
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Частка']}
            // Тултип робимо трохи світлішим за фон графіка, щоб він виділявся
            contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #38383A', borderRadius: '8px', color: '#f8fafc' }}
            itemStyle={{ color: '#e2e8f0', fontWeight: '500' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', color: '#8E8E93' }} />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>
  );
};

export default MarkowitzPieChart;
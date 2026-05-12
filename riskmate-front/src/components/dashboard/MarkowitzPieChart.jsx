import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#eab308', '#06b6d4'];

const MarkowitzPieChart = ({ allocations }) => {
  if (!allocations || Object.keys(allocations).length === 0) return null;

  const data = Object.keys(allocations).map((ticker) => ({
    name: ticker,
    value: allocations[ticker]
  })).filter(item => item.value > 0);

  return (
    <div style={{ 
      backgroundColor: 'rgba(30, 41, 59, 0.7)', 
      backdropFilter: 'blur(10px)',
      borderRadius: '16px', 
      padding: '24px', 
      border: '1px solid #334155',
      height: '450px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ color: '#f8fafc', margin: '0 0 10px 0', textAlign: 'center', fontSize: '18px' }}>
        Розподіл портфеля за Теорією Марковіца
      </h3>
      <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '13px', marginBottom: '20px' }}>
        Програма розрахувала ці частки для максимізації дохідності при мінімальному ризику.
      </p>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={140}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            label={({ name, value }) => `${name} ${value}%`}
            labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Частка']}
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', color: '#e2e8f0' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarkowitzPieChart;
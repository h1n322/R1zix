import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DistributionChart = ({ data, expectedPrice }) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ backgroundColor: '#1C1C1E', borderRadius: '16px', padding: '20px', border: '1px solid #38383A', marginTop: '20px', width: '100%' }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Розподіл ймовірностей (Дзвін Монте-Карло)
      </h3>
      
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#38383A" vertical={false} />
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
              formatter={(value) => [`${value} сценаріїв`, 'Ймовірність']}
              labelFormatter={(label) => `Фінальна ціна: $${label}`}
              cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
            />
            
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                // МАГІЯ КОЛЬОРУ: Якщо ціна менша за очікувану - червоний, якщо більша - зелений
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.price < expectedPrice ? 'rgba(255, 59, 48, 0.8)' : 'rgba(52, 199, 89, 0.8)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <p style={{ color: '#8E8E93', fontSize: '13px', marginTop: '15px', textAlign: 'center' }}>
        * <span style={{color: '#FF3B30'}}>Червона зона</span> — сценарії нижче очікуваної прибутковості (ризик). <span style={{color: '#34C759'}}>Зелена зона</span> — оптимістичні сценарії.
      </p>
    </div>
  );
};

export default DistributionChart;
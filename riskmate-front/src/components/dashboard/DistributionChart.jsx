import React, { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import styles from '../dashboard/css/DistributionChart.module.css';

const CustomDistributionTooltip = ({ active, payload, label, threshold }) => {
  if (active && payload && payload.length) {
    const barData = payload.find(p => p.dataKey === 'count');
    const countVal = barData ? barData.value : payload[0].value;
    const priceVal = typeof label === 'number' ? label : parseFloat(String(label).replace(/[^0-9.]/g, '')) || 0;
    const isRisk = priceVal < threshold;

    return (
      <div style={{ backgroundColor: '#1e293b', padding: '12px', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 14px rgba(0,0,0,0.5)' }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '4px', fontSize: '13px' }}>
          Ціновий інтервал: ${typeof label === 'number' ? label.toFixed(2) : label}
        </p>
        <p style={{ margin: '4px 0', color: '#e2e8f0', fontSize: '13px' }}>
          Кількість сценаріїв: <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{countVal}</span>
        </p>
        <p style={{ margin: '4px 0', fontSize: '12px', color: isRisk ? '#ef4444' : '#10b981', fontWeight: '600' }}>
          {isRisk ? '⚠️ Червона зона (Збиток / нижче очікуваного)' : '✅ Зелена зона (Оптимістичний сценарій)'}
        </p>
      </div>
    );
  }
  return null;
};

const DistributionChart = ({ data, expectedPrice }) => {
  // Нормалізація вхідних даних (від C#, Python або локального стейту)
  const { chartBins, threshold, stats } = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { chartBins: [], threshold: 0, stats: { redPct: 0, greenPct: 0, total: 0 } };
    }

    const parsed = data.map((item, idx) => {
      let priceNum = null;
      if (typeof item.price === 'number' && !isNaN(item.price)) {
        priceNum = item.price;
      } else if (item.binRange) {
        const matches = String(item.binRange).match(/[\d.]+/g);
        if (matches && matches.length >= 2) {
          priceNum = (parseFloat(matches[0]) + parseFloat(matches[1])) / 2;
        } else if (matches && matches.length === 1) {
          priceNum = parseFloat(matches[0]);
        }
      } else if (item.name) {
        const match = String(item.name).match(/[\d.]+/g);
        if (match) priceNum = parseFloat(match[0]);
      }

      if (priceNum === null) priceNum = idx;

      const count = Number(item.count ?? item.frequency ?? 0);
      const label = item.binRange || item.range || `$${priceNum.toFixed(1)}`;

      return {
        ...item,
        price: Number(priceNum.toFixed(1)),
        count: count,
        label: label
      };
    });

    // Розрахунок середнього та стандартного відхилення для дзвіноподібної кривої Гауса
    const totalCount = parsed.reduce((sum, b) => sum + b.count, 0) || 1;
    const weightedSum = parsed.reduce((sum, b) => sum + (b.price * b.count), 0);
    const meanPrice = weightedSum / totalCount;

    const varianceSum = parsed.reduce((sum, b) => sum + (b.count * Math.pow(b.price - meanPrice, 2)), 0);
    const stdDev = Math.sqrt(varianceSum / totalCount) || 1;

    const targetThreshold = Number(expectedPrice) || meanPrice;

    let redCount = 0;
    let greenCount = 0;
    const maxBarCount = Math.max(...parsed.map(b => b.count), 1);

    const withBellCurve = parsed.map(b => {
      if (b.price < targetThreshold) {
        redCount += b.count;
      } else {
        greenCount += b.count;
      }

      // Формула щільності нормального розподілу (дзвін Монте-Карло)
      const exponent = -0.5 * Math.pow((b.price - meanPrice) / stdDev, 2);
      const bellValue = maxBarCount * Math.exp(exponent);

      return {
        ...b,
        bellCurve: Number(bellValue.toFixed(1))
      };
    });

    const redPct = Number(((redCount / totalCount) * 100).toFixed(1));
    const greenPct = Number(((greenCount / totalCount) * 100).toFixed(1));

    return {
      chartBins: withBellCurve,
      threshold: targetThreshold,
      stats: { redPct, greenPct, total: totalCount }
    };
  }, [data, expectedPrice]);

  if (chartBins.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>📊 Очікування даних симуляції для побудови розподілу...</p>
      </div>
    );
  }

  return (
    <div className={styles.cardContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
        <h3 className={styles.title} style={{ margin: 0 }}>
          Розподіл ймовірностей (Дзвін Монте-Карло)
        </h3>
        <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
            Зона ризику: {stats.redPct}%
          </span>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>
            Оптимістична зона: {stats.greenPct}%
          </span>
        </div>
      </div>
      
      <div className={styles.chartWrapper} style={{ width: '100%', minWidth: 0, minHeight: '300px', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
          <ComposedChart data={chartBins} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
              content={<CustomDistributionTooltip threshold={threshold} />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            
            {/* Вертикальна розділова лінія очікуваної ціни */}
            {threshold > 0 && (
              <ReferenceLine 
                x={threshold} 
                stroke="#3B82F6" 
                strokeWidth={2}
                strokeDasharray="4 4" 
                label={{ 
                  position: 'top', 
                  value: `Очікувана ціна: $${threshold.toFixed(2)}`, 
                  fill: '#60a5fa', 
                  fontSize: 12,
                  fontWeight: 'bold'
                }} 
              />
            )}

            {/* Стовпчики гістограми з візуальним поділом на червону/зелену зони */}
            <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Сценарії">
              {chartBins.map((entry, index) => {
                const isRisk = entry.price < threshold;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={isRisk ? 'rgba(239, 68, 68, 0.85)' : 'rgba(16, 185, 129, 0.85)'}
                    stroke={isRisk ? '#ef4444' : '#10b981'}
                    strokeWidth={1}
                  />
                );
              })}
            </Bar>

            {/* Дзвіноподібна крива нормального розподілу (Bell Curve) */}
            <Line 
              type="monotone" 
              dataKey="bellCurve" 
              stroke="#38bdf8" 
              strokeWidth={2.5} 
              dot={false} 
              name="Дзвін розподілу" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <p className={styles.footerText}>
        * <span className={styles.redText}>Червона зона ({stats.redPct}%)</span> — сценарії нижче очікуваної прибутковості (ризик).{' '}
        <span className={styles.greenText}>Зелена зона ({stats.greenPct}%)</span> — оптимістичні сценарії.
      </p>
    </div>
  );
};

export default DistributionChart;
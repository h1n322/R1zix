import React, { useState, useMemo } from 'react';
// ReferenceLine для зон RSI
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import CandlestickChart from './CandlestickChart';
import { enrichChartData } from '../../utils/indicators';
import styles from '../dashboard/css/ChartArea.module.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const validEntries = payload.filter(entry => entry.value !== null && entry.value !== undefined && !isNaN(entry.value));
    if (validEntries.length === 0) return null;

    return (
      <div style={{ backgroundColor: '#1e293b', padding: '10px', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '5px' }}>
          Дата: {label}
        </p>
        {validEntries.map((entry, index) => {
          const isOscillator = entry.name.includes('RSI') || entry.name.includes('ATR') || entry.name.includes('%');
          const displayVal = isOscillator ? Number(entry.value).toFixed(2) : `$${Number(entry.value).toFixed(2)}`;
          return (
            <p key={index} style={{ margin: '3px 0', color: entry.color, fontSize: '13px' }}>
              {entry.name}: {displayVal}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const ChartArea = ({ chartData, isExpanded, onToggleExpand }) => {
  const [activePeriod, setActivePeriod] = useState('3М'); 
  
  const [showSMA, setShowSMA] = useState(false);
  const [showBB, setShowBB] = useState(false);
  const [showRSI, setShowRSI] = useState(false); 
  const [showATR, setShowATR] = useState(false); 
  
  const [chartType, setChartType] = useState('line');

  const timePeriods = useMemo(() => [
    { label: '1М', points: 30 },
    { label: '3М', points: 90 },
    { label: '6М', points: 180 },
    { label: '1Р', points: 365 },
    { label: 'ВСІ', points: 'all' }
  ], []);

  // Збагачуємо повний масив технічними індикаторами перед нарізкою
  const enrichedData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    return enrichChartData(chartData);
  }, [chartData]);

  const handlePeriodClick = (label) => {
    setActivePeriod(label);
  };

  const { visibleData, canShowCandles, hasData } = useMemo(() => {
    const hasData = enrichedData && enrichedData.length > 0;
    if (!hasData) {
      return { visibleData: [], canShowCandles: false, hasData: false };
    }

    const currentPeriod = timePeriods.find(p => p.label === activePeriod) || { points: 90 };
    let sliceStart = 0;
    if (currentPeriod.points !== 'all') {
      sliceStart = Math.max(0, enrichedData.length - currentPeriod.points);
    }
    const visibleData = enrichedData.slice(sliceStart);
    const canShowCandles = enrichedData.some(item => item.open !== undefined && item.open !== null);
    
    return { visibleData, canShowCandles, hasData };
  }, [enrichedData, activePeriod, timePeriods]);

  // Допоміжна функція для динамічних стилів кнопок
  const getBtnStyle = (isActive, activeColor) => ({
    background: isActive ? activeColor : 'transparent',
    color: isActive ? '#fff' : '#8E8E93',
    fontWeight: isActive ? 'bold' : 'normal',
  });

  return (
    <div 
      className={styles.cardContainer} 
      style={{ height: isExpanded ? 'calc(100vh - 120px)' : 600 }}
    >
      {hasData && (
        <div className={styles.controlsOverlay}>
          
          {canShowCandles && (
            <div className={styles.controlGroup}>
              <button className={styles.btn} style={getBtnStyle(chartType === 'line', '#10b981')} onClick={() => setChartType('line')}>Лінія</button>
              <button className={styles.btn} style={getBtnStyle(chartType === 'candle', '#10b981')} onClick={() => setChartType('candle')}>Свічки</button>
            </div>
          )}

          <div className={styles.controlGroup}>
            {timePeriods.map((p) => (
              <button key={p.label} className={styles.btn} style={getBtnStyle(activePeriod === p.label, '#3b82f6')} onClick={() => handlePeriodClick(p.label, p.points)}>
                {p.label}
              </button>
            ))}
          </div>

          {chartType === 'line' && (
            <div className={styles.controlGroup}>
              <button className={styles.btn} style={getBtnStyle(showSMA, '#f59e0b')} onClick={() => setShowSMA(!showSMA)}>SMA 50</button>
              <button className={styles.btn} style={getBtnStyle(showBB, '#a855f7')} onClick={() => setShowBB(!showBB)}>Bollinger</button>
              <button className={styles.btn} style={getBtnStyle(showRSI, '#ec4899')} onClick={() => setShowRSI(!showRSI)}>RSI 14</button>
              <button className={styles.btn} style={getBtnStyle(showATR, '#06b6d4')} onClick={() => setShowATR(!showATR)}>ATR</button>
            </div>
          )}
        </div>
      )}

      {hasData && (
        <button className={styles.expandBtn} onClick={onToggleExpand}>
          {isExpanded ? '↙ Згорнути' : '↗ На весь екран'}
        </button>
      )}

      {hasData ? (
        <div style={{ flex: 1, marginTop: '45px', position: 'relative', width: '100%', minWidth: 0, height: 400, minHeight: '400px' }}>
          {chartType === 'line' ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={380}>
              <ComposedChart data={visibleData}>                
                <defs>
                  <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF3B30" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#38383A" vertical={false} />
                <XAxis dataKey="name" stroke="#8E8E93" tick={{fill: '#8E8E93'}} tickMargin={10} minTickGap={20} />
                
                {/* Осі */}
                <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#8E8E93" tick={{fill: '#8E8E93'}} tickFormatter={(val) => `$${val}`} />
                {(showRSI || showATR) && (
                  <YAxis yAxisId="right" orientation="right" domain={showRSI ? [0, 100] : ['auto', 'auto']} stroke="#8E8E93" tick={{fill: '#8E8E93'}} />
                )}

                <Tooltip contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #38383A', borderRadius: '8px', color: '#fff' }} content={<CustomTooltip />} isAnimationActive={false} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                
                {/* Зони перекупленості/перепроданості для RSI */}
                {showRSI && <ReferenceLine yAxisId="right" y={70} stroke="#ec4899" strokeDasharray="3 3" opacity={0.5} label={{ value: '70', fill: '#ec4899', fontSize: 10, position: 'insideRight' }} />}
                {showRSI && <ReferenceLine yAxisId="right" y={30} stroke="#ec4899" strokeDasharray="3 3" opacity={0.5} label={{ value: '30', fill: '#ec4899', fontSize: 10, position: 'insideRight' }} />}

                {/* Графіки */}
                <Area yAxisId="left" isAnimationActive={false} connectNulls={true} type="monotone" dataKey="history" stroke="#10B981" fillOpacity={1} fill="url(#colorHistory)" name="Історія" strokeWidth={2} dot={false} />
                <Area yAxisId="left" isAnimationActive={true} connectNulls={true} type="monotone" dataKey="forecast" stroke="#0A84FF" fillOpacity={1} fill="url(#colorForecast)" name="Прогноз" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                <Area yAxisId="left" isAnimationActive={false} connectNulls={true} type="monotone" dataKey="actual" stroke="#FF3B30" fillOpacity={1} fill="url(#colorActual)" name="Реальність" strokeWidth={2} dot={false} />

                {showSMA && <Line yAxisId="left" isAnimationActive={true} connectNulls={true} type="monotone" dataKey="sma50" stroke="#f59e0b" dot={false} strokeWidth={2} name="SMA 50" />}
                {showBB && <Line yAxisId="left" isAnimationActive={true} connectNulls={true} type="monotone" dataKey="bb_upper" stroke="#a855f7" strokeDasharray="4 4" dot={false} strokeWidth={1.5} name="BB Верхня" />}
                {showBB && <Line yAxisId="left" isAnimationActive={true} connectNulls={true} type="monotone" dataKey="bb_lower" stroke="#a855f7" strokeDasharray="4 4" dot={false} strokeWidth={1.5} name="BB Нижня" />}
                
                {showRSI && <Line yAxisId="right" connectNulls={true} isAnimationActive={true} type="monotone" dataKey="rsi" stroke="#ec4899" dot={false} strokeWidth={2} name="RSI (14)" />}
                {showATR && <Line yAxisId="right" connectNulls={true} isAnimationActive={true} type="monotone" dataKey="atr" stroke="#06b6d4" dot={false} strokeWidth={2} name="ATR (14)" />}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <CandlestickChart data={visibleData} />
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div style={{ marginBottom: '16px', opacity: 0.2 }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 8px 0', color: '#e2e8f0', fontSize: '20px', fontWeight: '500' }}>Немає даних для відображення</h3>
          <p style={{ margin: 0, fontSize: '14px', maxWidth: '300px', textAlign: 'center', lineHeight: '1.5' }}>Оберіть актив у меню зліва та натисніть <b>Enter</b>, щоб побудувати графік</p>
        </div>
      )}
    </div>
  );
};

export default ChartArea;
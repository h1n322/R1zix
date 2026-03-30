import React, { useState, useEffect } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#1e293b', padding: '10px', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '5px' }}>
          Дата: {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '3px 0', color: entry.color, fontSize: '13px' }}>
            {entry.name}: ${entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartArea = ({ chartData, isExpanded, onToggleExpand }) => {
  const [zoomRange, setZoomRange] = useState({ start: 0, end: 100 });
  const [activePeriod, setActivePeriod] = useState('3М'); 
  const [showSMA, setShowSMA] = useState(false);
  const [showBB, setShowBB] = useState(false);

  const timePeriods = [
    { label: '1М', points: 60 },
    { label: '3М', points: 120 },
    { label: '6М', points: 210 },
    { label: '1Р', points: 400 },
    { label: 'ВСІ', points: 'all' }
  ];

  const handlePeriodClick = (label, points) => {
    setActivePeriod(label);
    if (!chartData || chartData.length === 0) return;
    
    if (points === 'all') {
      setZoomRange({ start: 0, end: chartData.length });
    } else {
      const startIndex = Math.max(0, chartData.length - points);
      setZoomRange({ start: startIndex, end: chartData.length });
    }
  };

  useEffect(() => {
    if (chartData && chartData.length > 0) {
      handlePeriodClick('3М', 120); 
    }
    // eslint-disable-next-line
  }, [chartData]);

  // ПЕРЕВІРКА НА НАЯВНІСТЬ ДАНИХ
  const hasData = chartData && chartData.length > 0;
  const visibleData = hasData ? chartData.slice(zoomRange.start, zoomRange.end) : [];

  return (
    <div 
      className="card" 
      style={{ 
        width: '100%', 
        height: isExpanded ? 'calc(100vh - 240px)' : 450, 
        padding: '20px', 
        position: 'relative', 
        transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
        marginBottom: '20px',
        overflow: 'hidden',
        display: 'flex',          // Додано для центрування заглушки
        flexDirection: 'column'   // Додано для центрування заглушки
      }}
    >
      {/* Показуємо кнопки управління ЛИШЕ якщо є дані */}
      {hasData && (
        <div style={{ position: 'absolute', top: '15px', left: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', zIndex: 10 }}>
          <div style={{ display: 'flex', backgroundColor: 'rgba(28, 28, 30, 0.8)', padding: '4px', borderRadius: '8px', border: '1px solid #38383A', backdropFilter: 'blur(10px)' }}>
            {timePeriods.map((p) => (
              <button
                key={p.label} onClick={() => handlePeriodClick(p.label, p.points)}
                style={{
                  background: activePeriod === p.label ? '#3b82f6' : 'transparent', color: activePeriod === p.label ? '#ffffff' : '#8E8E93',
                  border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: activePeriod === p.label ? 'bold' : 'normal',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(28, 28, 30, 0.8)', padding: '4px', borderRadius: '8px', border: '1px solid #38383A', backdropFilter: 'blur(10px)' }}>
            <button
              onClick={() => setShowSMA(!showSMA)}
              style={{
                background: showSMA ? '#f59e0b' : 'transparent', color: showSMA ? '#fff' : '#8E8E93',
                border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: showSMA ? 'bold' : 'normal'
              }}
            >
              SMA 50
            </button>
            <button
              onClick={() => setShowBB(!showBB)}
              style={{
                background: showBB ? '#a855f7' : 'transparent', color: showBB ? '#fff' : '#8E8E93',
                border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: showBB ? 'bold' : 'normal'
              }}
            >
              Bollinger Bands
            </button>
          </div>
        </div>
      )}

      {hasData && (
        <button
          onClick={onToggleExpand}
          style={{
            position: 'absolute', top: '15px', right: '20px', background: 'rgba(44, 44, 46, 0.8)',
            border: '1px solid #38383A', color: '#8E8E93', padding: '6px 12px',
            borderRadius: '16px', fontSize: '12px', cursor: 'pointer', zIndex: 10,
            backdropFilter: 'blur(10px)'
          }}
        >
          {isExpanded ? '↙ Згорнути' : '↗ На весь екран'}
        </button>
      )}

      {/* ЯКЩО Є ДАНІ - МАЛЮЄМО ГРАФІК. ЯКЩО НЕМАЄ - МАЛЮЄМО ЗАГЛУШКУ */}
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visibleData} margin={{ top: 45, right: 30, left: 0, bottom: 0 }}>
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
            <YAxis domain={['auto', 'auto']} stroke="#8E8E93" tick={{fill: '#8E8E93'}} tickFormatter={(val) => `$${val}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #38383A', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }} content={<CustomTooltip />} isAnimationActive={false} 
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Area isAnimationActive={false} type="monotone" dataKey="history" stroke="#34C759" fillOpacity={1} fill="url(#colorHistory)" name="Історія" strokeWidth={2} dot={false} />
            <Area isAnimationActive={true} type="monotone" dataKey="forecast" stroke="#0A84FF" fillOpacity={1} fill="url(#colorForecast)" name="Прогноз" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            <Area isAnimationActive={false} type="monotone" dataKey="actual" stroke="#FF3B30" fillOpacity={1} fill="url(#colorActual)" name="Реальність" strokeWidth={2} dot={false} />

            {showSMA && <Line isAnimationActive={true} type="monotone" dataKey="sma50" stroke="#f59e0b" dot={false} strokeWidth={2} name="SMA 50" />}
            {showBB && <Line isAnimationActive={true} type="monotone" dataKey="bb_upper" stroke="#a855f7" strokeDasharray="4 4" dot={false} strokeWidth={1.5} name="BB Верхня" />}
            {showBB && <Line isAnimationActive={true} type="monotone" dataKey="bb_lower" stroke="#a855f7" strokeDasharray="4 4" dot={false} strokeWidth={1.5} name="BB Нижня" />}
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        // --- СТАН ПОРОЖНЬОГО ЕКРАНА (EMPTY STATE) ---
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8E8E93' }}>
          <div style={{ marginBottom: '16px', opacity: 0.2 }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 8px 0', color: '#e2e8f0', fontSize: '20px', fontWeight: '500' }}>Немає даних для відображення</h3>
          <p style={{ margin: 0, fontSize: '14px', maxWidth: '300px', textAlign: 'center', lineHeight: '1.5' }}>
            Оберіть актив у меню зліва та натисніть <b>Enter</b>, щоб побудувати графік
          </p>
        </div>
      )}
    </div>
  );
};

export default ChartArea;
import React from 'react';
import { styles } from '../../styles';

const Sidebar = ({ 
  userTier, // Отримуємо статус з Dashboard
  ticker, setTicker, 
  algorithm, setAlgorithm, 
  simulations, setSimulations, 
  horizon, setHorizon,
  scenario, setScenario,
  lookback, setLookback, 
  varConf, setVarConf,   
  rfRate, setRfRate,     
  onRun, onDownload, onSave, onLoad, onExportCSV, isLoading 
}) => {

  const isPro = userTier === 'pro';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      if (!isLoading) onRun(); 
    }
  };

  return (
    <aside className="sidebar-mobile" style={styles.sidebar} onKeyDown={handleKeyDown}>
      <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>RiskMate</h2>
      
      <div style={styles.inputGroup}>
        <label style={styles.label}>Актив (Тикер)</label>
        <input 
          style={styles.input} 
          value={ticker} 
          onChange={e => setTicker(e.target.value.toUpperCase())}
          placeholder="AAPL, MSFT, BTC-USD..."
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button style={{ ...styles.button, backgroundColor: '#4f46e5', flex: 1 }} onClick={onSave}>
          💾 Зберегти
        </button>
        <button style={{ ...styles.button, backgroundColor: '#4f46e5', flex: 1 }} onClick={onLoad}>
          📂 Завантажити
        </button>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Тип алгоритму</label>
        <select style={styles.select} value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
          <option value="gbm">Classic GBM Monte Carlo</option>
          <option value="historical">Historical Simulation</option>
          <option value="merton">Merton Jump-Diffusion</option>
          <option value="garch">GARCH Volatility</option>
          <option value="stress">Stress Testing</option>
          <option value="backtest">Backtesting (Test)</option>
          
          {/* ЗАМКИ НА ПРЕМІУМ АЛГОРИТМИ */}
          <option value="lstm">
            {isPro ? 'AI Forecast (LSTM)' : '🔒 AI Forecast (Pro)'}
          </option>
          <option value="markowitz">
            {isPro ? ' Portfolio Optimization' : '🔒 Optimization (Pro)'}
          </option>
        </select>
      </div>

      {algorithm === 'stress' && (
        <div style={styles.inputGroup}>
          <label style={styles.label}>Сценарій кризи</label>
          <select style={styles.select} value={scenario} onChange={e => setScenario(e.target.value)}>
            <option value="covid">COVID-19 Crash (2020)</option>
            <option value="2008">Financial Crisis (2008)</option>
            <option value="dotcom">Dot-com Bubble (2000)</option>
            <option value="custom">Custom (-20% Drop)</option>
          </select>
        </div>
      )}

      <div style={styles.inputGroup}>
        <label style={styles.label}>Глибина історії</label>
        <select style={styles.select} value={lookback} onChange={e => setLookback(e.target.value)}>
          <option value={1}>1 Рік</option>
          <option value={3}>3 Роки</option>
          {/* ЗАМКИ НА ГЛИБОКУ ІСТОРІЮ */}
          <option value={5} disabled={!isPro}>{isPro ? '5 Років' : '🔒 5 Років (Pro)'}</option>
          <option value={10} disabled={!isPro}>{isPro ? '10 Років' : '🔒 10 Років (Pro)'}</option>
        </select>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Рівень довіри (VaR)</label>
        <select style={styles.select} value={varConf} onChange={e => setVarConf(e.target.value)}>
          <option value={0.90}>90% (Високий ризик)</option>
          <option value={0.95}>95% (Стандарт)</option>
          <option value={0.99}>99% (Базель III)</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Симуляцій</label>
          <input type="number" style={styles.input} value={simulations} onChange={e => setSimulations(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Горизонт</label>
          <input type="number" style={styles.input} value={horizon} onChange={e => setHorizon(e.target.value)} />
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Безризикова ставка (%)</label>
        <input 
          type="number" 
          step="0.1"
          style={styles.input} 
          value={rfRate} 
          onChange={e => setRfRate(e.target.value)} 
        />
      </div>

      <button 
        style={{ 
          ...styles.button, 
          width: '100%', 
          marginBottom: '15px', 
          opacity: isLoading ? 0.7 : 1,
          background: isPro ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : '#3b82f6'
        }} 
        onClick={onRun}
        disabled={isLoading}
      >
        {isLoading ? '⏳ Завантаження...' : isPro ? '🚀 Запустити Pro Аналіз' : 'Запустити симуляцію'}
      </button>

      <div style={{ display: 'flex', gap: '10px', width: '100%', paddingBottom: '20px' }}>
        <button style={{ ...styles.button, backgroundColor: '#6366f1', flex: 1, padding: '12px 0', fontSize: '14px' }} onClick={onDownload}>
          📄 PDF
        </button>
        <button style={{ ...styles.button, backgroundColor: '#10b981', flex: 1, padding: '12px 0', fontSize: '14px' }} onClick={onExportCSV}>
          📊 CSV
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
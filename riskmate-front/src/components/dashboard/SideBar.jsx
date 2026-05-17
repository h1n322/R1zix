import React, { useState } from 'react';
import styles from '../dashboard/css/SideBar.module.css';

const Sidebar = ({ 
  userTier, 
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
  // Стейт для керування виїзною панеллю (за замовчуванням відкрита)
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const isPro = userTier === 'pro';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      if (!isLoading) onRun(); 
    }
  };

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <div className={styles.wrapper}>
      
      {/* =======================
          DOCK (Ліва міні-панель) 
          ======================= */}
      <div className={styles.dock}>
        {/* Логотип (Буква R) */}
        <div className={styles.brandIcon}>R</div>

        {/* Кнопка налаштувань аналізу */}
        <button 
          className={`${styles.dockBtn} ${isDrawerOpen ? styles.dockBtnActive : ''}`}
          onClick={toggleDrawer}
          title="Налаштування аналізу"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6"/>
          </svg>
          <span>Аналіз</span>
        </button>

        {/* Кнопка Історії (Завантажити) */}
        <button className={styles.dockBtn} onClick={onLoad} title="Відкрити збережені портфелі">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
          <span>Історія</span>
        </button>

        {/* Кнопка Збереження */}
        <button className={styles.dockBtn} onClick={onSave} title="Зберегти поточний аналіз">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>
          </svg>
          <span>Зберегти</span>
        </button>

      </div>

      {/* =======================
          DRAWER (Виїзна панель) 
          ======================= */}
      <div className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : styles.drawerClosed}`} onKeyDown={handleKeyDown}>
        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
            <h2 className={styles.drawerTitle}>Параметри</h2>
            <button onClick={toggleDrawer} className={styles.closeDrawerBtn}>&times;</button>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Актив (Тикер)</label>
            <input 
              className={styles.input} 
              value={ticker} 
              onChange={e => setTicker(e.target.value.toUpperCase())}
              placeholder="AAPL, MSFT, BTC-USD..."
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Тип алгоритму</label>
            <select className={styles.select} value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
              <option value="gbm">Classic GBM Monte Carlo</option>
              <option value="historical">Historical Simulation</option>
              <option value="merton">Merton Jump-Diffusion</option>
              <option value="garch">GARCH Volatility</option>
              <option value="stress">Stress Testing</option>
              <option value="backtest">Backtesting (Test)</option>
              
              <option value="lstm" disabled={!isPro}>
                {isPro ? 'AI Forecast (LSTM)' : '🔒 AI Forecast (Pro)'}
              </option>
              <option value="markowitz" disabled={!isPro}>
                {isPro ? 'Portfolio Optimization' : '🔒 Optimization (Pro)'}
              </option>
            </select>
          </div>

          {algorithm === 'stress' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Сценарій кризи</label>
              <select className={styles.select} value={scenario} onChange={e => setScenario(e.target.value)}>
                <option value="covid">COVID-19 Crash (2020)</option>
                <option value="2008">Financial Crisis (2008)</option>
                <option value="dotcom">Dot-com Bubble (2000)</option>
                <option value="custom">Custom (-20% Drop)</option>
              </select>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Глибина історії</label>
            <select className={styles.select} value={lookback} onChange={e => setLookback(e.target.value)}>
              <option value={1}>1 Рік</option>
              <option value={3}>3 Роки</option>
              <option value={5} disabled={!isPro}>{isPro ? '5 Років' : '🔒 5 Років (Pro)'}</option>
              <option value={10} disabled={!isPro}>{isPro ? '10 Років' : '🔒 10 Років (Pro)'}</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Рівень довіри (VaR)</label>
            <select className={styles.select} value={varConf} onChange={e => setVarConf(e.target.value)}>
              <option value={0.90}>90% (Високий ризик)</option>
              <option value={0.95}>95% (Стандарт)</option>
              <option value={0.99}>99% (Базель III)</option>
            </select>
          </div>

          <div className={styles.row}>
            <div style={{ flex: 1 }}>
              <label className={styles.label}>Симуляцій</label>
              <input type="number" className={styles.input} value={simulations} onChange={e => setSimulations(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className={styles.label}>Горизонт</label>
              <input type="number" className={styles.input} value={horizon} onChange={e => setHorizon(e.target.value)} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Безризикова ставка (%)</label>
            <input 
              type="number" 
              step="0.1"
              className={styles.input} 
              value={rfRate} 
              onChange={e => setRfRate(e.target.value)} 
            />
          </div>

          <button 
            className={isPro ? styles.btnPro : styles.btnPrimary}
            onClick={onRun}
            disabled={isLoading}
          >
            {isLoading ? 'Рахунок..' : isPro ? 'Запустити аналіз' : 'Запустити симуляцію'}
          </button>

          <div className={styles.dockBottom}>
          {/* Кнопка PDF */}
          <button 
            className={`${styles.dockBtn} ${styles.dockBtnPdf}`} 
            onClick={onDownload} 
            title="Завантажити PDF звіт"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>PDF</span>
          </button>

          {/* Кнопка CSV */}
          <button 
            className={`${styles.dockBtn} ${styles.dockBtnCsv}`} 
            onClick={onExportCSV} 
            title="Експортувати дані в CSV"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M8 13h2v4H8z"/>
              <path d="M14 13h2v4h-2z"/>
            </svg>
            <span>CSV</span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
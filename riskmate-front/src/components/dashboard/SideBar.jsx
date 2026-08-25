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

  const algorithms = [
    { value: "gbm", label: "Classic GBM Monte Carlo", pro: false },
    { value: "historical", label: "Historical Simulation", pro: false },
    { value: "merton", label: "Merton Jump-Diffusion", pro: false },
    { value: "garch", label: "GARCH Volatility", pro: true },
    { value: "stress", label: "Stress Testing", pro: false },
    { value: "backtest", label: "Backtesting (Test)", pro: false },
    { value: "lstm", label: "AI Forecast (LSTM)", pro: true },
    { value: "markowitz", label: "Portfolio Optimization", pro: true }
  ];

  const CustomSelect = ({ value, onChange, options, isPro }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find(o => o.value === value);

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <div 
          className={styles.select} 
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <span>{selected?.label}</span>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 4 6 7 9 4"></polyline>
          </svg>
        </div>
        
        {isOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, 
            backgroundColor: '#0F172A', border: '1px solid #1F2937', 
            borderRadius: '8px', marginTop: '4px', zIndex: 10,
            overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: opt.value === value ? '#1E293B' : 'transparent',
                  color: (!isPro && opt.pro) ? '#64748B' : '#F8FAFC'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1E293B'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = opt.value === value ? '#1E293B' : 'transparent'}
              >
                <span>{opt.label}</span>
                {(!isPro && opt.pro) && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                )}
                {(isPro && opt.pro) && (
                  <span style={{ fontSize: '10px', background: '#3B82F6', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>PRO</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      
      {/* =======================
          DOCK (Ліва міні-панель) 
          ======================= */}
      <div className={styles.dock}>
        {/* Логотип (Буква R) */}

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
              list="popular-tickers"
              className={styles.input} 
              value={ticker} 
              onChange={e => setTicker(e.target.value.toUpperCase())}
              placeholder="Оберіть зі списку або введіть..."
              autoComplete="off"
            />
            <datalist id="popular-tickers">
              {/* Популярні акції */}
              <option value="AAPL">Apple Inc.</option>
              <option value="MSFT">Microsoft Corp.</option>
              <option value="NVDA">NVIDIA Corp.</option>
              <option value="GOOGL">Alphabet (Google)</option>
              <option value="AMZN">Amazon.com</option>
              <option value="META">Meta Platforms</option>
              <option value="TSLA">Tesla Inc.</option>
              <option value="BRK-B">Berkshire Hathaway</option>
              <option value="JPM">JPMorgan Chase</option>
              <option value="V">Visa Inc.</option>
              {/* Популярні ETF */}
              <option value="SPY">SPDR S&P 500 ETF</option>
              <option value="QQQ">Invesco QQQ (Nasdaq 100)</option>
              <option value="DIA">SPDR Dow Jones ETF</option>
              {/* Криптовалюти */}
              <option value="BTC-USD">Bitcoin (Крипто)</option>
              <option value="ETH-USD">Ethereum (Крипто)</option>
              <option value="SOL-USD">Solana (Крипто)</option>
              <option value="BNB-USD">Binance Coin (Крипто)</option>
              {/* Європейські та інші компанії */}
              <option value="NVO">Novo Nordisk</option>
              <option value="ASML">ASML Holding</option>
              <option value="TCEHY">Tencent Holdings</option>
            </datalist>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Тип алгоритму</label>
            <CustomSelect 
              value={algorithm} 
              onChange={setAlgorithm} 
              options={algorithms} 
              isPro={isPro} 
            />
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
            onClick={!isPro ? (e) => { e.preventDefault(); onDownload(); } : onDownload}
            style={!isPro ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            title={isPro ? "Завантажити PDF звіт" : "🔒 PDF звіт (Pro)"}
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
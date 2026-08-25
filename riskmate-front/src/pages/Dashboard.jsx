import { Icon } from "@iconify/react";
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, getDocs, query, orderBy, limit, doc, setDoc, getDoc } from 'firebase/firestore'; 
import { logout, db } from '../firebase';
import toast, { Toaster } from 'react-hot-toast'; 
import { 
  WatchlistDrawer, 
  AssetDetails, 
  NewsFeed, 
  CorrelationMatrix, 
  DistributionChart, 
  Sidebar, 
  KpiCards, 
  ChartArea, 
  PortfolioTable, 
  MarkowitzPieChart 
} from '../components/dashboard';
import Header from '../components/shared/Header';
import { styles } from '../styles';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [ticker, setTicker] = useState('');
  const [algorithm, setAlgorithm] = useState('gbm');
  const [simulations, setSimulations] = useState(1000);
  const [horizon, setHorizon] = useState(30);
  const [chartData, setChartData] = useState([]);
  const [scenario, setScenario] = useState('covid');
  const [aiSummary, setAiSummary] = useState(null);
  const [lstmForecast, setLstmForecast] = useState(null);
  const [hedging, setHedging] = useState(null);
  const [metrics, setMetrics] = useState({ expected_price: 0, var_5: 0, cvar_5: 0, volatility: 0 });
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [watchlist, setWatchlist] = useState(['AAPL', 'MSFT', 'NVDA', 'BTC-USD']); 
  const [assetDetails, setAssetDetails] = useState(null); 
  const [news, setNews] = useState([]);                           
  const [correlationMatrix, setCorrelationMatrix] = useState(null); 
  const [histogramData, setHistogramData] = useState([]); 
  const [markowitzData, setMarkowitzData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lookback, setLookback] = useState(5);
  const [varConf, setVarConf] = useState(0.95);
  const [rfRate, setRfRate] = useState(4.5);

  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/');  
    } catch (error) {
      console.error("Помилка виходу:", error);
    }
  };

  const runSimulation = async () => {
    
    // --- ЗАХИСТ PRO-ФУНКЦІЙ ---
    const premiumAlgorithms = ['lstm', 'markowitz']; 
    
    if (premiumAlgorithms.includes(algorithm) && user?.tier !== 'pro') {
      toast.error('Цей алгоритм доступний лише у тарифі Pro Analyst!', {
        icon: '🔒',
        duration: 4000,
        style: {
          borderRadius: '10px',
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #3b82f6'
        },
      });
      setTimeout(() => navigate('/pricing'), 1500);
      return; 
    }

    if (parseInt(lookback) > 3 && user?.tier !== 'pro') {
      toast.error('Глибина історії більше 3 років доступна лише в Pro Analyst!', { icon: '🔒' });
      setTimeout(() => navigate('/pricing'), 1500);
      return; 
    }
    
    if (ticker.includes(',') && algorithm !== 'markowitz') {
      toast.error('Для аналізу кількох активів оберіть тип алгоритму -- "Markowitz Portfolio Optimization"', {
        duration: 5000,
        icon: '⚠️',
      });
      return; 
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Опрацювання даних...');
    try {
      if (algorithm === 'lstm') {
        const aiResp = await fetch(`http://127.0.0.1:8000/api/predict/${ticker}`);
        const aiData = await aiResp.json();

        if (aiData.error) {
          toast.error(aiData.error, { id: loadingToast });
          setIsLoading(false);
          return;
        }

        const simResp = await fetch('http://127.0.0.1:8000/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ticker, 
            algorithm: 'gbm', 
            simulations: parseInt(simulations), 
            horizon: parseInt(horizon), 
            scenario,
            lookback_years: parseInt(lookback),      
            var_confidence: parseFloat(varConf),     
            risk_free_rate: parseFloat(rfRate).replace(',', '.') / 100 
          })
        });
        const simData = await simResp.json();

        setChartData(simData.chart_data);
        setAssetDetails(simData.stock_info);
        setNews(simData.news);                                 
        setCorrelationMatrix(simData.correlation_matrix);      
        setHistogramData(simData.histogram); 

        setMetrics({
          expected_price: aiData.predicted_price_tomorrow, 
          var_5: simData.var_5,                            
          cvar_5: simData.cvar_5,
          volatility: simData.volatility 
        });

        toast.success(`ШІ дав прогноз ціни, а Монте-Карло розрахував ризики!`, { id: loadingToast });
      } 
      else if (algorithm === 'markowitz') {
        if (!ticker.includes(',')) {
          toast.error("Для оптимізації введіть мінімум 2 тикери через кому", { id: loadingToast });
          setIsLoading(false);
          return;
        }

        const resp = await fetch('http://127.0.0.1:8000/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tickers: ticker })
        });
        const data = await resp.json();

        if (data.error) {
          toast.error(data.error, { id: loadingToast });
        } else {
          setMetrics({
            expected_price: data.expected_annual_return, 
            volatility: data.annual_volatility,
            var_5: 0, 
            cvar_5: 0 
          });
          setMarkowitzData(data.allocations);
          setCorrelationMatrix(data.correlation_matrix); 
          setChartData([]);
          setHistogramData([]);
          setAssetDetails(null);
          setNews([]);

          toast.success("Портфель успішно оптимізовано!", { id: loadingToast });
        }
      }
      else {
        const token = localStorage.getItem('token');
        const resp = await fetch('/api/simulation/run', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            ticker: ticker,
            algorithm: algorithm === 'stress' ? 'gbm' : algorithm,
            simulationsCount: parseInt(simulations),
            horizon: parseInt(horizon),
            scenario: algorithm === 'stress' ? scenario : 'base',
            confidenceLevel: parseFloat(varConf),
            lookbackYears: parseInt(lookback)
          })
        });
        const data = await resp.json();
        
        if (!resp.ok) {
          throw new Error(data.message || 'Помилка під час симуляції');
        }
        setChartData(data.chartPoints || []);
        
        setMetrics({
          expected_price: data.expectedPrice || 0,
          var_5: data.valueAtRisk || 0,
          cvar_5: data.conditionalValueAtRisk || 0,
          volatility: data.volatility || 0,
        });
        
        // Отримуємо деталі про актив безпосередньо від Python Data Gateway
        try {
          const infoResp = await fetch(`http://127.0.0.1:8000/api/info/${ticker}`);
          if (infoResp.ok) {
            const infoData = await infoResp.json();
            setAssetDetails(infoData);
          } else {
            setAssetDetails(null);
          }
        } catch (e) {
          console.error("Не вдалося завантажити деталі активу", e);
          setAssetDetails(null);
        }
        
        setNews(data.news || []);
        setAiSummary(data.aiSummary || null);
        setHedging(data.hedging || null);
        setCorrelationMatrix(null);
        setHistogramData(data.histogramBins || []); 
        
        toast.success('Симуляцію завершено!', { id: loadingToast });

        // Спробуємо отримати LSTM прогноз з Python бекенду
        try {
          const mlResp = await fetch(`http://127.0.0.1:8000/api/predict/${ticker}`);
          if (mlResp.ok) {
            const mlData = await mlResp.json();
            setLstmForecast(mlData.predicted_price_tomorrow);
          } else {
            setLstmForecast(null);
          }
        } catch (mlErr) {
          console.warn("ML бекенд недоступний", mlErr);
          setLstmForecast(null);
        }
      }
    } catch (err) {
      toast.error('Помилка під час виконання запиту', { id: loadingToast });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async () => {
    if (user?.tier !== 'pro') {
      toast.error('Експорт PDF доступний лише у тарифі Pro Analyst! ', { icon: '🔒' });
      setTimeout(() => navigate('/pricing'), 1500);
      return;
    }
    const loadingToast = toast.loading('Генерація PDF...');
    try {
      const resp = await fetch('/api/simulation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticker, algorithm, simulationsCount: parseInt(simulations), horizon: parseInt(horizon), scenario 
        })
      });
      if (!resp.ok) {
        throw new Error('Помилка сервера при генерації PDF');
      }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RiskMate_Report_${ticker}.pdf`;
      a.click();
      toast.success('Звіт завантажено!', { id: loadingToast });
    } catch (err) { 
      toast.error('Помилка завантаження PDF', { id: loadingToast });
    }
  };

  const savePortfolio = async () => {
    if (!user) return toast.error("Спочатку увійдіть через Google!");
    if (!metrics.expected_price && chartData.length === 0) return toast.error("Запустіть симуляцію перед збереженням!");

    const loadingToast = toast.loading('Збереження у PostgreSQL...');
    try {
      // 1. Отримуємо токен
      const token = await user.getIdToken();

      // 2. Формуємо DTO для C#
      const portfolioDto = {
        tickers: ticker,
        algorithm: algorithm || 'gbm',
        simulationsCount: parseInt(simulations) || 1000,
        horizon: parseInt(horizon) || 30,
        scenario: scenario || 'covid',
        
        expectedPrice: metrics.expected_price || 0,
        valueAtRisk: metrics.var_5 || 0,
        conditionalValueAtRisk: metrics.cvar_5 || 0,
        volatility: metrics.volatility || 0,
        sharpeRatio: metrics.sharpeRatio || 0, 
        maxDrawdown: metrics.maxDrawdown || 0,

        // Мапимо масив графіка
        chartPoints: chartData.map(p => ({
          dateLabel: p.name?.toString() || '',
          expectedPrice: p.forecast || p.history || p.actual || 0,
          lowerBound: p.bb_lower || 0,
          upperBound: p.bb_upper || 0
        })),

        // Мапимо деталі компанії (C# очікує масив)
        assetDetails: assetDetails ? [{
          ticker: assetDetails.symbol || ticker,
          companyName: assetDetails.shortName || '',
          sector: assetDetails.sector || '',
          currentPrice: assetDetails.currentPrice || 0
        }] : [],

        // Мапимо гістограму
        histogramBins: histogramData ? histogramData.map(b => ({
          binRange: b.range || b.name?.toString() || '',
          frequency: b.count || b.frequency || 0
        })) : []
      };

      // 3. Відправляємо на C#
      const response = await fetch("http://localhost:5266/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(portfolioDto)
      });

      if (!response.ok) throw new Error("Помилка сервера C#");

      toast.success("Портфель успішно збережено!", { id: loadingToast });
    } catch (e) {
      toast.error("Помилка збереження: " + e.message, { id: loadingToast });
    }
  };

  const downloadCSV = () => {
    if (!chartData || chartData.length === 0) return toast.error('Немає даних для експорту! Запустіть симуляцію.');
    const loadingToast = toast.loading('Генерація CSV...');
    const headers = ['Date', 'History_Price', 'Forecast_Price', 'Actual_Price', 'SMA50', 'BB_Upper', 'BB_Lower'];
    const csvRows = [headers.join(',')];
    chartData.forEach(row => {
      const values = [row.name, row.history || '', row.forecast || '', row.actual || '', row.sma50 || '', row.bb_upper || '', row.bb_lower || ''];
      csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RiskMate_Data_${ticker}.csv`;
    a.click();
    toast.success('CSV-дані успішно завантажено!', { id: loadingToast });
  };

  const loadPortfolio = async () => {
    if (!user) return toast.error("Спочатку увійдіть через Google!");
    const loadingToast = toast.loading('Завантаження...');
    try {
      const token = await user.getIdToken();
      
      const response = await fetch("http://localhost:5266/api/portfolio", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Помилка сервера");
      
      const data = await response.json();

      if (data.length > 0) {
        // Беремо найперший (найновіший) портфель з БД
        const latest = data[0]; 
        loadSelectedPortfolio(latest);
        toast.success("Останній портфель завантажено!", { id: loadingToast });
      } else {
        toast.error("У вас ще немає збережених портфелів.", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Помилка завантаження: " + e.message, { id: loadingToast });
    }
  };

  React.useEffect(() => {
    if (location.state?.portfolioToLoad) {
      loadSelectedPortfolio(location.state.portfolioToLoad);
      window.history.replaceState({}, document.title)
    }

    // Перевірка на повернення після успішної оплати Stripe
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      toast.success('Оплата успішна! Вітаємо в тарифі PRO 🎉', { duration: 5000 });
      // Очищаємо URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state, location.search]);

  const loadSelectedPortfolio = (data) => {
    setTicker(data.tickers || 'AAPL');
    setAlgorithm(data.algorithm || 'gbm');
    setSimulations(data.simulationsCount || 1000);
    setHorizon(data.horizon || 30);
    setScenario(data.scenario || 'covid');

    // Відновлюємо метрики
    setMetrics({
      expected_price: data.expectedPrice,
      var_5: data.valueAtRisk,
      cvar_5: data.conditionalValueAtRisk,
      volatility: data.volatility,
      sharpeRatio: data.sharpeRatio,
      maxDrawdown: data.maxDrawdown
    });

    // Відновлюємо графік
    if (data.chartPoints) {
      setChartData(data.chartPoints.map(cp => ({
        name: cp.dateLabel,
        forecast: cp.expectedPrice,
        bb_lower: cp.lowerBound,
        bb_upper: cp.upperBound
      })));
    } else {
      setChartData([]);
    }

    // Відновлюємо деталі активу
    if (data.assetDetails && data.assetDetails.length > 0) {
      setAssetDetails({
        symbol: data.assetDetails[0].ticker,
        shortName: data.assetDetails[0].companyName,
        sector: data.assetDetails[0].sector,
        currentPrice: data.assetDetails[0].currentPrice
      });
    } else {
      setAssetDetails(null);
    }

    // Відновлюємо гістограму
    if (data.histogramBins) {
      setHistogramData(data.histogramBins.map(hb => ({
        name: hb.binRange,
        count: hb.frequency
      })));
    } else {
      setHistogramData([]);
    }

    // Очищаємо дані матриці (бо для збережених ми їх поки не записуємо)
    setCorrelationMatrix(null);
    setNews([]);
    setIsChartExpanded(false);
  };

  React.useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid, "settings", "watchlist");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().tickers) {
          setWatchlist(docSnap.data().tickers);
        }
      } catch(e) {}
    };
    fetchWatchlist();
  }, [user]);

  const updateWatchlist = async (newList) => {
    setWatchlist(newList);
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "settings", "watchlist"), { tickers: newList }, { merge: true });
    } catch(e) {}
  };

  const addToWatchlist = (newTicker) => {
    if (!watchlist.includes(newTicker)) {
      updateWatchlist([...watchlist, newTicker]);
      toast.success(`${newTicker} додано до списку!`);
    }
  };

  const removeFromWatchlist = (tickerToRemove) => {
    updateWatchlist(watchlist.filter(t => t !== tickerToRemove));
  };
  console.log("ПОТОЧНИЙ СТАН ASSET DETAILS:", assetDetails); // <--- ДОДАЙ ЦЕЙ РЯДОК
  return (
    <div style={styles.app} className="dashboard-layout">
      <Toaster position="top-right" /> 
      
      {/* ПЕРЕДАЄМО СТАТУС В SIDEBAR */}
      <Sidebar className="sidebar-mobile"
        userTier={user?.tier}
        ticker={ticker} setTicker={setTicker}
        algorithm={algorithm} setAlgorithm={setAlgorithm}
        simulations={simulations} setSimulations={setSimulations}
        horizon={horizon} setHorizon={setHorizon}
        scenario={scenario} setScenario={setScenario}
        lookback={lookback} setLookback={setLookback}   
        varConf={varConf} setVarConf={setVarConf}       
        rfRate={rfRate} setRfRate={setRfRate}           
        onRun={runSimulation} onDownload={downloadReport}
        onSave={savePortfolio} onLoad={loadPortfolio}
        onExportCSV={downloadCSV} 
        isLoading={isLoading} 
      />
      <main style={styles.main} className="main-content-mobile">
        
        <Header user={user} onLogout={handleLogout} onOpenWatchlist={() => setIsWatchlistOpen(true)} />
        
        <WatchlistDrawer 
          isOpen={isWatchlistOpen} 
          onClose={() => setIsWatchlistOpen(false)} 
          watchlist={watchlist} 
          onAdd={addToWatchlist} 
          onRemove={removeFromWatchlist}
          onSelect={(t) => setTicker(t)} 
        />
        
        {/* БЕЙДЖ ПОТОЧНОГО ТАРИФУ */}
        <div style={{ marginBottom: '20px', marginLeft: '5px' }}>
          <span style={{ 
            color: user?.tier === 'pro' ? '#fbbf24' : '#94a3b8',
            border: `1px solid ${user?.tier === 'pro' ? '#fbbf24' : '#475569'}`,
            padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
            backgroundColor: user?.tier === 'pro' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(148, 163, 184, 0.1)'
          }}>
            {user?.tier === 'pro' ? 'Pro' : 'Basic'}
          </span>
        </div>

        <KpiCards metrics={metrics} varConf={varConf} algorithm={algorithm} />
        
        {algorithm === 'markowitz' && markowitzData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
            <MarkowitzPieChart allocations={markowitzData} />
            {correlationMatrix && <CorrelationMatrix matrix={correlationMatrix} />}
          </div>
        )}

        {(chartData && chartData.length > 0 && algorithm !== 'markowitz') && (
          <div style={{ 
            backgroundColor: '#0B0E14', 
            padding: '20px 24px', 
            borderRadius: '16px', 
            marginBottom: '20px', 
            border: '1px solid #1F2937',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ 
              color: '#f8fafc', 
              marginTop: 0, 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(59, 130, 246, 0.15)', 
                color: '#3b82f6', 
                padding: '8px', 
                borderRadius: '10px' 
              }}>
                <Icon icon="lucide:brain-circuit" width="22" height="22" />
              </div>
              AI Аналітика
            </h3>
            
            {aiSummary ? (
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', margin: '0 0 10px 0' }}>{aiSummary}</p>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic', margin: '0 0 10px 0' }}>
                Аналітика від LLM недоступна (переконайся, що C# сервер перезапущено і введено Gemini API ключ).
              </p>
            )}
            
            {lstmForecast ? (
              <div style={{ marginTop: '10px', display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '10px 15px', borderRadius: '10px' }}>
                <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '5px' }}>Прогноз нейромережі (LSTM) на завтра:</span>
                <span style={{ color: '#3b82f6', fontSize: '18px', fontWeight: 'bold' }}>${lstmForecast.toFixed(2)}</span>
              </div>
            ) : (
              <div style={{ marginTop: '10px' }}>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>LSTM прогноз недоступний. Python-мікросервіс вимкнений або модель не знайдена. </span>
                <button 
                  onClick={async () => {
                    toast.loading('Навчання моделі...', {id: 'train'});
                    try {
                      const res = await fetch(`http://127.0.0.1:8000/api/ml/train/${ticker}`, {method: 'POST'});
                      if (res.ok) toast.success('Навчання розпочато! Це займе 1-2 хвилини.', {id: 'train'});
                      else throw new Error("Помилка");
                    } catch (e) {
                      toast.error('Не вдалося звʼязатися з Python-сервером на порту 8000.', {id: 'train'});
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                >
                  Натренувати модель
                </button>
              </div>
            )}
          </div>
        )}

        {algorithm !== 'markowitz' && (
          <ChartArea chartData={chartData} isExpanded={isChartExpanded} onToggleExpand={() => setIsChartExpanded(!isChartExpanded)} />
        )}

        {!isChartExpanded && algorithm !== 'markowitz' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px', marginBottom: '20px' }}>
            <AssetDetails details={assetDetails} />

            {hedging && (
              <div style={{ 
                backgroundColor: '#0B0E14', 
                padding: '20px 24px', 
                borderRadius: '16px', 
                border: '1px solid #1F2937', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px' 
              }}>
                <h3 style={{ 
                  color: '#f8fafc', 
                  marginTop: 0, 
                  marginBottom: '4px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                    color: '#10b981', 
                    padding: '8px', 
                    borderRadius: '10px' 
                  }}>
                    <Icon icon="lucide:shield-check" width="22" height="22" />
                  </div>
                  Ідея для хеджування (Black-Scholes)
                </h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>
                  Щоб захистити свій портфель від падіння нижче рівня ризику (VaR) <strong>${hedging.strikePrice.toFixed(2)}</strong> на наступні {hedging.expiration}, ви можете купити <strong>Put-опціон</strong>.
                </p>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Орієнтовна премія за 1 акцію</div>
                    <div style={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold' }}>${hedging.putOptionPremium.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Вартість контракту (100 акцій)</div>
                    <div style={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold' }}>${hedging.totalCostFor100Shares.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <NewsFeed news={news} />
              <CorrelationMatrix matrix={correlationMatrix} />
            </div>
            {histogramData && (
  <DistributionChart data={histogramData} expectedPrice={metrics.expected_price} />
)}
          </div>
        )}
        
        {!isChartExpanded && <PortfolioTable user={user} onLoadPortfolio={loadSelectedPortfolio} />}
      </main>
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  const [ticker, setTicker] = useState('AAPL');
  const [algorithm, setAlgorithm] = useState('gbm');
  const [simulations, setSimulations] = useState(1000);
  const [horizon, setHorizon] = useState(30);
  const [scenario, setScenario] = useState('covid');
  const [chartData, setChartData] = useState([]);
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
      toast.error('Цей алгоритм доступний лише у тарифі Pro Analyst! 🚀', {
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
        const resp = await fetch('http://127.0.0.1:8000/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ticker, 
            algorithm, 
            simulations: parseInt(simulations), 
            horizon: parseInt(horizon), 
            scenario,
            lookback_years: parseInt(lookback),      
            var_confidence: parseFloat(varConf),     
            risk_free_rate: parseFloat(rfRate) / 100 
          })
        });
        const data = await resp.json();
        setChartData(data.chart_data);
        setMetrics(data);
       setAssetDetails(data.stock_info);
        setNews(data.news);                                 
        setCorrelationMatrix(data.correlation_matrix);      
        setHistogramData(data.histogram); 
        toast.success('Симуляцію завершено!', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Помилка під час виконання запиту', { id: loadingToast });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async () => {
    const loadingToast = toast.loading('Генерація PDF...');
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticker, algorithm, simulations: parseInt(simulations), horizon: parseInt(horizon), scenario 
        })
      });
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

    const loadingToast = toast.loading('Збереження...');
    try {
      await addDoc(collection(db, "users", user.uid, "portfolios"), { 
        tickers: ticker,
        inputs: { algorithm, simulations: parseInt(simulations), horizon: parseInt(horizon), scenario: scenario || 'covid' },
        metrics,
        chartData,
        assetDetails, 
        news,                 
        correlationMatrix,    
        histogramData, 
        updatedAt: new Date().toISOString()
      });
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
      const q = query(collection(db, "users", user.uid, "portfolios"), orderBy("updatedAt", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setTicker(data.tickers || 'AAPL');
        if (data.inputs) {
          setAlgorithm(data.inputs.algorithm || 'gbm');
          setSimulations(data.inputs.simulations || 1000);
          setHorizon(data.inputs.horizon || 30);
          setScenario(data.inputs.scenario || 'covid');
        }
        if (data.metrics) setMetrics(data.metrics);
        if (data.chartData) setChartData(data.chartData);
        setAssetDetails(data.stock_info || null); 
        setNews(data.news || []);                                 
        setCorrelationMatrix(data.correlationMatrix || null);     
        setHistogramData(data.histogramData || []); 
        toast.success("Останній портфель завантажено!", { id: loadingToast });
      } else {
        toast.error("У вас ще немає збережених портфелів.", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Помилка завантаження: " + e.message, { id: loadingToast });
    }
  };

  const loadSelectedPortfolio = (data) => {
    setTicker(data.tickers || 'AAPL');
    if (data.inputs) {
      setAlgorithm(data.inputs.algorithm || 'gbm');
      setSimulations(data.inputs.simulations || 1000);
      setHorizon(data.inputs.horizon || 30);
      setScenario(data.inputs.scenario || 'covid');
    }
    if (data.metrics) setMetrics(data.metrics);
    if (data.chartData) setChartData(data.chartData);
    setAssetDetails(data.stock_info|| null); 
    setNews(data.news || []);
    setCorrelationMatrix(data.correlationMatrix || null);
    setHistogramData(data.histogramData || []); 
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

        <KpiCards metrics={metrics} varConf={varConf} />
        
        {algorithm === 'markowitz' && markowitzData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
            <MarkowitzPieChart allocations={markowitzData} />
            {correlationMatrix && <CorrelationMatrix matrix={correlationMatrix} />}
          </div>
        )}

        {algorithm !== 'markowitz' && (
          <ChartArea chartData={chartData} isExpanded={isChartExpanded} onToggleExpand={() => setIsChartExpanded(!isChartExpanded)} />
        )}

        {!isChartExpanded && algorithm !== 'markowitz' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px', marginBottom: '20px' }}>
            <AssetDetails details={assetDetails} />
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
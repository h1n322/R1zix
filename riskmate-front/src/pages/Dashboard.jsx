/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import { Icon } from "@iconify/react";
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, getDocs, query, orderBy, limit, doc, setDoc, getDoc } from 'firebase/firestore'; 
import { logout, db, auth } from '../firebase';
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
import { getTickerProfile } from '../utils/indicators';
import { styles } from '../styles';

const generateFallbackStockInfo = (t, points = []) => {
  const profile = getTickerProfile(t);
  const histPoints = (points || []).filter(p => typeof p.history === 'number' && !isNaN(p.history));
  const lastPrice = histPoints.length > 0 ? histPoints[histPoints.length - 1].history : profile.basePrice;
  const maxPrice = histPoints.length > 0 ? Math.max(...histPoints.map(p => p.history)) : lastPrice * 1.25;
  const minPrice = histPoints.length > 0 ? Math.min(...histPoints.map(p => p.history)) : lastPrice * 0.75;
  return [
    { label: "Компанія", value: profile.name },
    { label: "Сектор", value: profile.sector },
    { label: "Поточна ціна (S₀)", value: `$${Number(lastPrice).toFixed(2)}` },
    { label: "Обсяг", value: profile.volume },
    { label: "52-тиж. макс.", value: `$${Number(maxPrice).toFixed(2)}` },
    { label: "Бета-фактор", value: profile.beta },
    { label: "52-тиж. мін.", value: `$${Number(minPrice).toFixed(2)}` },
    { label: "Р/Е (Ц/П)", value: profile.pe }
  ];
};

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
  const [metrics, setMetrics] = useState({ 
    expected_price: 0, 
    expectedPrice: 0, 
    var_5: 0, 
    valueAtRisk: 0, 
    cvar_5: 0, 
    conditionalValueAtRisk: 0, 
    volatility: 0, 
    annualVolatility: 0, 
    sharpeRatio: 0, 
    sharpe_ratio: 0, 
    maxDrawdown: 0, 
    max_drawdown: 0 
  });
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [watchlist, setWatchlist] = useState(['AAPL', 'MSFT', 'NVDA', 'BTC-USD']); 
  const [assetDetails, setAssetDetails] = useState(null); 
  const [news, setNews] = useState([]);                           
  const [correlationMatrix, setCorrelationMatrix] = useState(null); 
  const [histogramData, setHistogramData] = useState([]); 
  const [markowitzData, setMarkowitzData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);
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

  const handleRunSimulation = async () => {
    
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

    const cleanTicker = (ticker || '').trim().toUpperCase();
    if (!cleanTicker) {
      toast.error('Введіть тикер активу!', {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #ef4444'
        }
      });
      return;
    }
    
    if (cleanTicker.includes(',') && algorithm !== 'markowitz') {
      toast.error('Для аналізу кількох активів оберіть тип алгоритму -- "Markowitz Portfolio Optimization"', {
        duration: 5000,
        icon: '⚠️',
      });
      return; 
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Опрацювання даних...');
    try {
      if (algorithm === 'markowitz') {
        if (!cleanTicker.includes(',')) {
          toast.error("Для оптимізації введіть мінімум 2 тикери через кому", { id: loadingToast });
          setIsLoading(false);
          return;
        }

        const resp = await fetch('/ai/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tickers: cleanTicker })
        });
        const data = await resp.json();

        if (data.error) {
          toast.error(data.error, { id: loadingToast });
        } else {
          setMetrics({
            expected_price: data.expected_annual_return, 
            expectedPrice: data.expected_annual_return,
            volatility: data.annual_volatility,
            annualVolatility: data.annual_volatility,
            var_5: 0, 
            valueAtRisk: 0,
            cvar_5: 0,
            conditionalValueAtRisk: 0,
            sharpeRatio: 0,
            maxDrawdown: 0
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
        // Отримуємо auth токен (якщо користувач авторизований)
        let token = null;
        try {
          if (auth?.currentUser) {
            token = await auth.currentUser.getIdToken();
          } else {
            token = localStorage.getItem('token');
          }
        } catch (tokenErr) {
          console.warn("Не вдалося отримати токен:", tokenErr);
          token = localStorage.getItem('token');
        }

        const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Паралельно робимо запит до LSTM (ML-прогноз ціни на завтра)
        const mlPromise = fetch(`/ai/predict/${cleanTicker}`)
          .then(async r => {
            if (r.ok) {
              const d = await r.json();
              return (d && typeof d.predicted_price_tomorrow === 'number') ? d.predicted_price_tomorrow : null;
            }
            return null;
          })
          .catch(err => {
            console.warn("ML бекенд недоступний:", err);
            return null;
          });

        // Формуємо параметри симуляції для C# MathEngine
        const simAlgorithm = (algorithm === 'stress' || algorithm === 'lstm') ? 'gbm' : algorithm;
        const simScenario = algorithm === 'stress' ? scenario : 'base';
        const parsedConf = parseFloat(varConf) || 0.95;
        const parsedRfRate = (parseFloat(rfRate.toString().replace(',', '.')) || 4.5) / 100;
        const isBacktest = algorithm === 'backtest';

        const runResp = await fetch('/api/simulation/run', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify({ 
            ticker: cleanTicker,
            algorithm: simAlgorithm,
            simulationsCount: parseInt(simulations) || 1000,
            horizon: parseInt(horizon) || 30,
            scenario: simScenario,
            confidenceLevel: parsedConf,
            varConfidence: parsedConf,
            lookbackYears: parseInt(lookback) || 5,
            riskFreeRate: parsedRfRate,
            isBacktest
          })
        });

        const runData = await runResp.json();
        if (!runResp.ok) {
          throw new Error(runData.message || runData.Message || 'Помилка під час симуляції');
        }

        const jobId = runData.jobId || runData.JobId;
        if (!jobId) {
          throw new Error('Не отримано ідентифікатор завдання (jobId)');
        }

        // Опитування статусу кожні 800мс (~32 секунди таймаут)
        const maxAttempts = 40;
        const pollInterval = 800;
        let completedData = null;
        let consecutiveErrors = 0;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise(res => setTimeout(res, pollInterval));

          let statusResp;
          try {
            statusResp = await fetch(`/api/simulation/status/${jobId}`, {
              headers: { ...authHeaders }
            });
            consecutiveErrors = 0;
          } catch (netErr) {
            consecutiveErrors++;
            console.warn(`Спроба опитування ${attempt + 1} мережева помилка:`, netErr);
            if (consecutiveErrors >= 5) {
              throw new Error('Втрачено зʼєднання із сервером під час очікування результату симуляції.');
            }
            continue;
          }

          // 404 означає, що бекграунд воркер ще не встиг записати перший статус у Redis/кеш
          if (statusResp.status === 404) {
            continue;
          }

          if (!statusResp.ok) {
            if (statusResp.status >= 500) {
              consecutiveErrors++;
              console.warn(`Спроба опитування ${attempt + 1} помилка сервера:`, statusResp.status);
              if (consecutiveErrors >= 4) {
                const errJson = await statusResp.json().catch(() => ({}));
                throw new Error(errJson.Message || errJson.message || `Помилка сервера (${statusResp.status})`);
              }
              continue;
            }
            const errJson = await statusResp.json().catch(() => ({}));
            throw new Error(errJson.Message || errJson.message || `Помилка опитування статусу (${statusResp.status})`);
          }

          const pollData = await statusResp.json();
          const currentStatus = (pollData.Status || pollData.status || '').toLowerCase();

          const progress = pollData.Progress ?? pollData.progress;
          const msg = pollData.Message ?? pollData.message;
          const translateProgressMsg = (m) => {
            if (!m) return 'Опрацювання даних';
            if (m.includes('historical data')) return 'Отримання історичних даних';
            if (m.includes('mathematical simulation')) return 'Математичне моделювання Монте-Карло';
            if (m.includes('AI analytics')) return 'Аналіз ризиків та пошук новин';
            return m;
          };

          if (progress && msg) {
            toast.loading(`${translateProgressMsg(msg)} (${progress}%)...`, { id: loadingToast });
          } else if (progress) {
            toast.loading(`Опрацювання даних (${progress}%)...`, { id: loadingToast });
          } else if (msg) {
            toast.loading(`${translateProgressMsg(msg)}...`, { id: loadingToast });
          }

          if (currentStatus === 'completed') {
            completedData = pollData;
            break;
          }

          if (currentStatus === 'failed' || currentStatus === 'error') {
            throw new Error(pollData.Error || pollData.error || pollData.Message || pollData.message || 'Симуляція завершилася помилкою');
          }
        }

        if (!completedData) {
          throw new Error('Час очікування симуляції вичерпано (~30с). Спробуйте пізніше.');
        }

        const res = completedData.Result || completedData.result || {};

        // 1. Точки графіка
        const rawPoints = res.ChartPoints || res.chartPoints || res.chart_data || [];
        const mappedChartData = rawPoints.map((p, idx) => {
          const name = p.Name ?? p.name ?? p.dateLabel ?? p.Date ?? p.date ?? `T+${idx}`;
          const history = p.History !== undefined ? p.History : (p.history ?? null);
          const forecast = p.Forecast !== undefined ? p.Forecast : (p.forecast ?? null);
          const actual = p.Actual !== undefined ? p.Actual : (p.actual ?? null);
          const lowerBound = p.LowerBound ?? p.lowerBound ?? p.bb_lower ?? p.BbLower ?? null;
          const upperBound = p.UpperBound ?? p.upperBound ?? p.bb_upper ?? p.BbUpper ?? null;
          return {
            ...p,
            name,
            history,
            forecast,
            actual,
            lowerBound,
            upperBound,
            bb_lower: p.bb_lower ?? p.BbLower ?? lowerBound,
            bb_upper: p.bb_upper ?? p.BbUpper ?? upperBound,
            sma50: p.Sma50 ?? p.sma50 ?? p.sma_50 ?? null,
            rsi: p.Rsi ?? p.rsi ?? null,
            atr: p.Atr ?? p.atr ?? null,
          };
        });
        setChartData(mappedChartData);

        // 2. LSTM прогноз та розрахункові метрики
        const predictedTomorrow = await mlPromise;
        setLstmForecast(predictedTomorrow);

        const expPrice = (algorithm === 'lstm' && predictedTomorrow !== null)
          ? predictedTomorrow
          : Number(res.ExpectedPrice ?? res.expectedPrice ?? res.expected_price ?? 0);
        const varVal = Number(res.ValueAtRisk ?? res.valueAtRisk ?? res.var_5 ?? 0);
        const cvarVal = Number(res.ConditionalValueAtRisk ?? res.conditionalValueAtRisk ?? res.cvar_5 ?? 0);
        const volVal = Number(res.Volatility ?? res.volatility ?? res.annual_volatility ?? 0);
        const sharpeVal = Number(res.SharpeRatio ?? res.sharpeRatio ?? res.sharpe_ratio ?? 0);
        const maxDdVal = Number(res.MaxDrawdown ?? res.maxDrawdown ?? res.max_drawdown ?? 0);

        setMetrics({
          expected_price: expPrice,
          expectedPrice: expPrice,
          var_5: varVal,
          valueAtRisk: varVal,
          cvar_5: cvarVal,
          conditionalValueAtRisk: cvarVal,
          volatility: volVal,
          annualVolatility: volVal,
          sharpeRatio: sharpeVal,
          sharpe_ratio: sharpeVal,
          maxDrawdown: maxDdVal,
          max_drawdown: maxDdVal,
        });

        // 3. Деталі активу (StockInfo або запит до Python Gateway або fallback профіль)
        const rawStockInfo = res.StockInfo || res.stockInfo || res.stock_info;
        if (Array.isArray(rawStockInfo) && rawStockInfo.length > 0) {
          setAssetDetails(rawStockInfo.map(item => ({
            label: item.Label ?? item.label ?? '',
            value: item.Value ?? item.value ?? ''
          })));
        } else {
          try {
            const infoResp = await fetch(`/ai/info/${cleanTicker}`);
            if (infoResp.ok) {
              const infoData = await infoResp.json();
              if (Array.isArray(infoData) && infoData.length > 0) {
                setAssetDetails(infoData.map(item => ({
                  label: item.label ?? item.Label ?? '',
                  value: item.value ?? item.Value ?? ''
                })));
              } else {
                setAssetDetails(generateFallbackStockInfo(cleanTicker, mappedChartData));
              }
            } else {
              setAssetDetails(generateFallbackStockInfo(cleanTicker, mappedChartData));
            }
          } catch (e) {
            console.warn("Не вдалося завантажити деталі активу з gateway, застосовано базовий профіль:", e);
            setAssetDetails(generateFallbackStockInfo(cleanTicker, mappedChartData));
          }
        }

        // 4. Новини
        const rawNews = res.News || res.news || [];
        setNews((Array.isArray(rawNews) ? rawNews : []).map(item => ({
          title: item.Title ?? item.title ?? '',
          publisher: item.Publisher ?? item.publisher ?? '',
          link: item.Link ?? item.link ?? '#',
          timestamp: Number(item.Timestamp ?? item.timestamp ?? 0)
        })));

        // 5. ШІ Підсумок
        setAiSummary(res.AiSummary || res.aiSummary || res.ai_summary || null);

        // 6. Хеджування (Black-Scholes)
        const rawHedging = res.Hedging || res.hedging;
        if (rawHedging) {
          setHedging({
            strikePrice: Number(rawHedging.StrikePrice ?? rawHedging.strikePrice ?? 0),
            putOptionPremium: Number(rawHedging.PutOptionPremium ?? rawHedging.putOptionPremium ?? 0),
            totalCostFor100Shares: Number(rawHedging.TotalCostFor100Shares ?? rawHedging.totalCostFor100Shares ?? 0),
            expiration: String(rawHedging.Expiration ?? rawHedging.expiration ?? '')
          });
        } else {
          setHedging(null);
        }

        // 7. Гістограма
        const rawBins = res.HistogramBins || res.histogramBins || res.Histogram || res.histogram || [];
        setHistogramData((Array.isArray(rawBins) ? rawBins : []).map(b => {
          const binRange = b.BinRange ?? b.binRange ?? b.range ?? b.name ?? '';
          let price = b.Price !== undefined ? Number(b.Price) : (b.price !== undefined ? Number(b.price) : undefined);
          if (price === undefined && (b.MinValue !== undefined || b.minValue !== undefined)) {
            const minV = Number(b.MinValue ?? b.minValue);
            const maxV = Number(b.MaxValue ?? b.maxValue);
            price = Number(((minV + maxV) / 2).toFixed(2));
          }
          if (price === undefined && binRange) {
            const matches = String(binRange).match(/[\d.]+/g);
            if (matches && matches.length >= 2) {
              price = Number(((parseFloat(matches[0]) + parseFloat(matches[1])) / 2).toFixed(2));
            } else if (matches && matches.length === 1) {
              price = parseFloat(matches[0]);
            }
          }
          const count = Number(b.Frequency ?? b.frequency ?? b.Count ?? b.count ?? 0);
          return {
            name: binRange,
            binRange,
            range: binRange,
            frequency: count,
            count,
            price
          };
        }));

        // 8. Кореляційна матриця та флаг імітації
        const rawMatrix = res.CorrelationMatrix || res.correlationMatrix || res.correlation_matrix || null;
        setCorrelationMatrix(rawMatrix);
        setIsMock(Boolean(res.is_mock ?? res.isMock ?? res.IsMock ?? false));

        // 9. Сповіщення про успіх
        if (algorithm === 'lstm') {
          if (predictedTomorrow !== null) {
            toast.success('ШІ дав прогноз ціни, а Монте-Карло розрахував ризики!', { id: loadingToast });
          } else {
            toast('LSTM модель не натренована для цього активу. Розраховано за класичним методом.', { icon: 'ℹ️', id: loadingToast });
          }
        } else {
          toast.success('Симуляцію завершено!', { id: loadingToast });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Помилка під час виконання запиту', { id: loadingToast });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const runSimulation = handleRunSimulation;

  const downloadReport = async () => {
    if (user?.tier !== 'pro') {
      toast.error('Експорт PDF доступний лише у тарифі Pro Analyst! ', { icon: '🔒' });
      setTimeout(() => navigate('/pricing'), 1500);
      return;
    }
    const loadingToast = toast.loading('Генерація PDF...');
    try {
      const cleanTicker = (ticker || 'AAPL').trim().toUpperCase();
      const endpoint = '/api/simulation/report';
      const isBacktest = algorithm === 'backtest';
      
      const payload = {
        ticker: cleanTicker, 
        algorithm: (algorithm === 'stress' || algorithm === 'lstm') ? 'gbm' : algorithm, 
        simulationsCount: parseInt(simulations) || 1000, 
        horizon: parseInt(horizon) || 30, 
        scenario: algorithm === 'stress' ? scenario : 'base',
        confidenceLevel: parseFloat(varConf) || 0.95,
        lookbackYears: parseInt(lookback) || 5,
        riskFreeRate: (parseFloat(rfRate.toString().replace(',', '.')) || 4.5) / 100,
        isBacktest
      };

      let token = null;
      try {
        if (auth?.currentUser) token = await auth.currentUser.getIdToken();
        else token = localStorage.getItem('token');
      } catch (tokenErr) {
        token = localStorage.getItem('token');
      }

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.Message || errJson.message || 'Помилка сервера при генерації PDF');
      }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RiskMate_Report_${cleanTicker}.pdf`;
      a.click();
      toast.success('Звіт завантажено!', { id: loadingToast });
    } catch (err) { 
      toast.error(err.message || 'Помилка завантаження PDF', { id: loadingToast });
    }
  };

  const savePortfolio = async () => {
    if (!user) return toast.error("Спочатку увійдіть через Google!");
    if (!metrics.expected_price && chartData.length === 0) return toast.error("Запустіть симуляцію перед збереженням!");

    const loadingToast = toast.loading('Збереження у PostgreSQL...');
    try {
      // 1. Отримуємо токен
      const token = await auth.currentUser.getIdToken();
      const cleanTicker = (ticker || 'AAPL').trim().toUpperCase();

      let mappedAssetDetails = [];
      if (Array.isArray(assetDetails) && assetDetails.length > 0) {
        const comp = assetDetails.find(i => i.label && /компан|назва|name/i.test(i.label))?.value || cleanTicker;
        const sec = assetDetails.find(i => i.label && /сектор|sector/i.test(i.label))?.value || '';
        const rawPriceStr = assetDetails.find(i => i.label && /ціна|відкриття|price|open/i.test(i.label))?.value || '';
        const parsedPrice = parseFloat(String(rawPriceStr).replace(/[^0-9.]/g, '')) || 
          (chartData.length > 0 ? Number(chartData[chartData.length - 1].history ?? chartData[chartData.length - 1].forecast ?? 0) : 0);
        mappedAssetDetails = [{
          ticker: cleanTicker,
          companyName: comp,
          sector: sec,
          currentPrice: parsedPrice
        }];
      } else if (assetDetails && typeof assetDetails === 'object') {
        mappedAssetDetails = [{
          ticker: assetDetails.symbol || assetDetails.ticker || cleanTicker,
          companyName: assetDetails.companyName || assetDetails.shortName || cleanTicker,
          sector: assetDetails.sector || '',
          currentPrice: Number(assetDetails.currentPrice) || 0
        }];
      }

      // 2. Формуємо DTO для C#
      const portfolioDto = {
        tickers: cleanTicker,
        algorithm: algorithm || 'gbm',
        simulationsCount: parseInt(simulations) || 1000,
        horizon: parseInt(horizon) || 30,
        scenario: scenario || 'covid',
        
        expectedPrice: metrics.expected_price || metrics.expectedPrice || 0,
        valueAtRisk: metrics.var_5 || metrics.valueAtRisk || 0,
        conditionalValueAtRisk: metrics.cvar_5 || metrics.conditionalValueAtRisk || 0,
        volatility: metrics.volatility || metrics.annualVolatility || 0,
        sharpeRatio: metrics.sharpeRatio || metrics.sharpe_ratio || 0, 
        maxDrawdown: metrics.maxDrawdown || metrics.max_drawdown || 0,

        // Мапимо масив графіка
        chartPoints: chartData.map(p => ({
          dateLabel: p.name?.toString() || '',
          expectedPrice: p.forecast || p.history || p.actual || 0,
          lowerBound: p.lowerBound ?? p.bb_lower ?? 0,
          upperBound: p.upperBound ?? p.bb_upper ?? 0
        })),

        // Мапимо деталі компанії (C# очікує масив)
        assetDetails: mappedAssetDetails,

        // Мапимо гістограму
        histogramBins: histogramData ? histogramData.map(b => ({
          binRange: b.binRange || b.range || b.name?.toString() || '',
          frequency: b.frequency || b.count || 0
        })) : []
      };

      // 3. Відправляємо на C#
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(portfolioDto)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.Message || errJson.message || "Помилка сервера C#");
      }

      window.dispatchEvent(new Event('riskmate_portfolio_saved'));
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
    a.download = `Rizix_Data_${ticker}.csv`;
    a.click();
    toast.success('CSV-дані успішно завантажено!', { id: loadingToast });
  };

  const loadPortfolio = async () => {
    if (!user) return toast.error("Спочатку увійдіть через Google!");
    const loadingToast = toast.loading('Завантаження...');
    try {
      const token = await auth.currentUser.getIdToken();
      
      const response = await fetch("/api/portfolio", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Помилка сервера");
      
      const data = await response.json();

      if (data.length > 0) {
        // Беремо найперший (найновіший) портфель з БД
        const latestInfo = data[0];
        
        // Fetch full details
        const detailsResp = await fetch(`/api/portfolio/${latestInfo.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (detailsResp.ok) {
          const latest = await detailsResp.json();
          loadSelectedPortfolio(latest);
          toast.success("Останній портфель завантажено!", { id: loadingToast });
        } else {
          throw new Error("Не вдалося завантажити деталі");
        }
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

    // Відновлюємо дані графіка
    if (data.chartPoints) {
      // Сортуємо по ID, щоб зберегти хронологічний порядок, якщо EF Core повернув їх перемішаними
      const sortedPoints = [...data.chartPoints].sort((a, b) => (a.id || 0) - (b.id || 0));
      const horizonCount = data.horizon || 30;
      const historyCount = sortedPoints.length > horizonCount ? sortedPoints.length - horizonCount : 0;

      setChartData(sortedPoints.map((cp, idx) => {
        const isHistory = idx < historyCount;
        const isForecast = idx >= historyCount - 1;

        return {
          name: cp.dateLabel,
          history: isHistory ? cp.expectedPrice : null,
          forecast: isForecast ? cp.expectedPrice : null,
          bb_lower: isForecast ? cp.lowerBound : null,
          bb_upper: isForecast ? cp.upperBound : null
        };
      }));
    } else {
      setChartData([]);
    }

    // Відновлюємо деталі активу
    if (data.assetDetails && data.assetDetails.length > 0) {
      const ad = data.assetDetails[0];
      setAssetDetails([
        { label: "Компанія", value: ad.companyName || ad.ticker || data.tickers || '' },
        { label: "Сектор", value: ad.sector || 'N/A' },
        { label: "Ціна на момент збереження", value: `$${Number(ad.currentPrice || 0).toFixed(2)}` }
      ]);
    } else {
      setAssetDetails(null);
    }

    // Відновлюємо гістограму
    if (data.histogramBins) {
      setHistogramData(data.histogramBins);
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

        <KpiCards metrics={metrics} varConf={varConf} algorithm={algorithm} isLoading={isLoading} />
        
        {isMock && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #ef4444',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Icon icon="lucide:alert-triangle" width="24" height="24" />
            <div>
              <strong>Увага: перевищено ліміт запитів до біржі.</strong>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>
                Відображаються демонстраційні (згенеровані) дані замість реальних. Спробуйте пізніше або зменшіть інтенсивність запитів.
              </div>
            </div>
          </div>
        )}

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
                      const res = await fetch(`/ai/ml/train/${ticker}`, {method: 'POST'});
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

        {(isLoading || (chartData && chartData.length > 0 && algorithm !== 'markowitz')) && (
          <ChartArea 
            chartData={chartData} 
            isExpanded={isChartExpanded} 
            onToggleExpand={() => setIsChartExpanded(!isChartExpanded)} 
            isLoading={isLoading}
          />
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
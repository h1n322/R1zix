/**
 * utils/indicators.js — Розрахунок технічних індикаторів та фінансових метрик на клієнті
 */

/**
 * Отримує числову ціну з точки графіка
 */
export const getPointPrice = (point) => {
  if (!point) return null;
  if (typeof point.close === 'number' && !isNaN(point.close)) return point.close;
  if (typeof point.history === 'number' && !isNaN(point.history)) return point.history;
  if (typeof point.actual === 'number' && !isNaN(point.actual)) return point.actual;
  if (typeof point.forecast === 'number' && !isNaN(point.forecast)) return point.forecast;
  if (typeof point.expectedPrice === 'number' && !isNaN(point.expectedPrice)) return point.expectedPrice;
  if (typeof point.price === 'number' && !isNaN(point.price)) return point.price;
  return null;
};

/**
 * Просте ковзне середнє (SMA)
 */
export const calculateSMA = (prices, period = 50) => {
  const result = new Array(prices.length).fill(null);
  if (!prices || prices.length === 0) return result;

  for (let i = 0; i < prices.length; i++) {
    if (i + 1 >= Math.min(period, 5)) {
      const slice = prices.slice(Math.max(0, i - period + 1), i + 1).filter(p => p !== null && !isNaN(p));
      if (slice.length > 0) {
        const sum = slice.reduce((acc, val) => acc + val, 0);
        result[i] = Number((sum / slice.length).toFixed(2));
      }
    }
  }
  return result;
};

/**
 * Смуги Боллінджера (Bollinger Bands 20, 2 std)
 */
export const calculateBollingerBands = (prices, period = 20, multiplier = 2) => {
  const upper = new Array(prices.length).fill(null);
  const lower = new Array(prices.length).fill(null);
  const middle = new Array(prices.length).fill(null);

  if (!prices || prices.length === 0) return { upper, lower, middle };

  for (let i = 0; i < prices.length; i++) {
    if (i >= 2) {
      const slice = prices.slice(Math.max(0, i - period + 1), i + 1).filter(p => p !== null && !isNaN(p));
      if (slice.length >= 2) {
        const mean = slice.reduce((sum, v) => sum + v, 0) / slice.length;
        const variance = slice.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / slice.length;
        const stdDev = Math.sqrt(variance);
        
        middle[i] = Number(mean.toFixed(2));
        upper[i] = Number((mean + multiplier * stdDev).toFixed(2));
        lower[i] = Number((mean - multiplier * stdDev).toFixed(2));
      }
    }
  }
  return { upper, lower, middle };
};

/**
 * Індекс відносної сили (RSI 14)
 */
export const calculateRSI = (prices, period = 14) => {
  const rsi = new Array(prices.length).fill(null);
  if (!prices || prices.length < 2) return rsi;

  let gains = [];
  let losses = [];

  for (let i = 1; i < prices.length; i++) {
    const pPrev = prices[i - 1];
    const pCurr = prices[i];
    if (pPrev === null || pCurr === null || isNaN(pPrev) || isNaN(pCurr)) {
      gains.push(0);
      losses.push(0);
      continue;
    }
    const change = pCurr - pPrev;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < gains.length; i++) {
    if (i < period) {
      avgGain += gains[i] / period;
      avgLoss += losses[i] / period;
      if (i === period - 1) {
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi[i + 1] = Number((100 - (100 / (1 + rs))).toFixed(2));
      }
    } else {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi[i + 1] = Number((100 - (100 / (1 + rs))).toFixed(2));
    }
  }

  for (let i = 1; i < Math.min(period, rsi.length); i++) {
    if (rsi[i] === null && rsi[period]) {
      rsi[i] = rsi[period];
    }
  }

  return rsi;
};

/**
 * Середній істинний діапазон (ATR 14)
 */
export const calculateATR = (data, period = 14) => {
  const atr = new Array(data.length).fill(null);
  if (!data || data.length < 2) return atr;

  const trs = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      const high = data[i].high ?? data[i].history ?? data[i].forecast ?? 0;
      const low = data[i].low ?? data[i].history ?? data[i].forecast ?? 0;
      trs.push(Math.abs(high - low) || 1);
    } else {
      const high = data[i].high ?? getPointPrice(data[i]) ?? 0;
      const low = data[i].low ?? getPointPrice(data[i]) ?? 0;
      const prevClose = data[i - 1].close ?? getPointPrice(data[i - 1]) ?? 0;

      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trs.push(tr);
    }
  }

  let avgTr = 0;
  for (let i = 0; i < trs.length; i++) {
    if (i < period) {
      avgTr += trs[i] / period;
      if (i >= 2) {
        atr[i] = Number((avgTr * (period / (i + 1))).toFixed(2));
      }
    } else {
      avgTr = (avgTr * (period - 1) + trs[i]) / period;
      atr[i] = Number(avgTr.toFixed(2));
    }
  }

  return atr;
};

/**
 * Генератор стандартного нормального розподілу N(0, 1) методом Бокса-Мюллера
 */
export const standardNormal = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

/**
 * Розраховує коефіцієнт Шарпа та максимальну просадку за історичними даними (річна шкала)
 */
export const calculateFinancialMetrics = (points, riskFreeRatePct = 4.5) => {
  if (!points || points.length === 0) {
    return { sharpeRatio: 0, maxDrawdown: 0, volatility: 0, annualizedReturn: 0 };
  }

  // Виділяємо виключно історичні ціни закриття
  const historyPrices = points
    .filter(p => p.history !== null && p.history !== undefined && !isNaN(p.history) && p.history > 0)
    .map(p => Number(p.history));

  if (historyPrices.length < 2) {
    return { sharpeRatio: 0, maxDrawdown: 0, volatility: 0, annualizedReturn: 0 };
  }

  // Денні логарифмічні доходності r_t = ln(P_t / P_{t-1})
  const logReturns = [];
  for (let i = 1; i < historyPrices.length; i++) {
    logReturns.push(Math.log(historyPrices[i] / historyPrices[i - 1]));
  }

  const meanDailyReturn = logReturns.reduce((s, r) => s + r, 0) / logReturns.length;
  const varianceDaily = logReturns.reduce((s, r) => s + Math.pow(r - meanDailyReturn, 2), 0) / (logReturns.length - 1 || 1);
  const dailyVol = Math.sqrt(varianceDaily);

  // Річна шкала (252 торгові дні на рік)
  const annualizedReturn = meanDailyReturn * 252;
  const annualizedVol = dailyVol * Math.sqrt(252);
  const rf = (Number(String(riskFreeRatePct).replace(',', '.')) || 4.5) / 100;

  // Коефіцієнт Шарпа: (mu_annual - Rf) / sigma_annual
  const sharpe = annualizedVol > 0 ? (annualizedReturn - rf) / annualizedVol : 0;

  // Максимальна історична просадка (Peak-to-Trough Drawdown)
  let peak = historyPrices[0];
  let maxDrawdownPct = 0;

  for (let i = 0; i < historyPrices.length; i++) {
    const p = historyPrices[i];
    if (p > peak) {
      peak = p;
    }
    if (peak > 0) {
      const drawdown = ((p - peak) / peak) * 100;
      if (drawdown < maxDrawdownPct) {
        maxDrawdownPct = drawdown;
      }
    }
  }

  return {
    sharpeRatio: Number(sharpe.toFixed(2)),
    maxDrawdown: Number(Math.abs(maxDrawdownPct).toFixed(2)),
    volatility: Number((annualizedVol * 100).toFixed(2)),
    annualizedReturn: Number((annualizedReturn * 100).toFixed(2))
  };
};

/**
 * Збагачує масив точок усіма технічними індикаторами (SMA 50, Bollinger, RSI, ATR)
 */
export const enrichChartData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];

  const rawPrices = data.map(getPointPrice);

  const smaValues = calculateSMA(rawPrices, 50);
  const bbValues = calculateBollingerBands(rawPrices, 20, 2);
  const rsiValues = calculateRSI(rawPrices, 14);
  const atrValues = calculateATR(data, 14);

  return data.map((item, i) => {
    const name = item.name || item.dateLabel || item.date || `T+${i}`;
    const history = item.history !== undefined ? item.history : null;
    const forecast = item.forecast !== undefined ? item.forecast : null;
    const actual = item.actual !== undefined ? item.actual : null;

    const sma50 = item.sma50 ?? item.sma_50 ?? smaValues[i] ?? null;
    const bb_upper = item.bb_upper ?? item.bbUpper ?? item.upperBound ?? bbValues.upper[i] ?? null;
    const bb_lower = item.bb_lower ?? item.bbLower ?? item.lowerBound ?? bbValues.lower[i] ?? null;
    const rsi = item.rsi !== undefined ? item.rsi : (rsiValues[i] ?? null);
    const atr = item.atr !== undefined ? item.atr : (atrValues[i] ?? null);

    return {
      ...item,
      name,
      history,
      forecast,
      actual,
      sma50,
      bb_upper,
      bb_lower,
      rsi,
      atr
    };
  });
};

const KNOWN_TICKERS = {
  'KO': { name: 'The Coca-Cola Company', sector: 'Consumer Defensive', basePrice: 63.50, annualVol: 0.15, drift: 0.08, pe: '24.8', beta: '0.55', volume: '14.2 млн' },
  'PEP': { name: 'PepsiCo, Inc.', sector: 'Consumer Defensive', basePrice: 172.00, annualVol: 0.16, drift: 0.08, pe: '26.1', beta: '0.58', volume: '6.1 млн' },
  'MSFT': { name: 'Microsoft Corporation', sector: 'Technology', basePrice: 422.00, annualVol: 0.22, drift: 0.14, pe: '35.4', beta: '1.15', volume: '22.8 млн' },
  'AAPL': { name: 'Apple Inc.', sector: 'Technology', basePrice: 224.50, annualVol: 0.20, drift: 0.13, pe: '33.2', beta: '1.05', volume: '48.5 млн' },
  'NVDA': { name: 'NVIDIA Corporation', sector: 'Semiconductors', basePrice: 128.00, annualVol: 0.45, drift: 0.28, pe: '54.2', beta: '1.68', volume: '88.3 млн' },
  'TSLA': { name: 'Tesla, Inc.', sector: 'Automotive', basePrice: 218.00, annualVol: 0.52, drift: 0.20, pe: '65.0', beta: '2.12', volume: '65.4 млн' },
  'AMZN': { name: 'Amazon.com, Inc.', sector: 'Consumer Cyclical', basePrice: 178.50, annualVol: 0.28, drift: 0.15, pe: '42.0', beta: '1.25', volume: '31.2 млн' },
  'GOOGL': { name: 'Alphabet Inc. (Google)', sector: 'Communication Services', basePrice: 176.00, annualVol: 0.24, drift: 0.13, pe: '23.8', beta: '1.06', volume: '19.4 млн' },
  'GOOG': { name: 'Alphabet Inc.', sector: 'Communication Services', basePrice: 177.00, annualVol: 0.24, drift: 0.13, pe: '23.8', beta: '1.06', volume: '18.1 млн' },
  'META': { name: 'Meta Platforms, Inc.', sector: 'Communication Services', basePrice: 515.00, annualVol: 0.32, drift: 0.18, pe: '26.8', beta: '1.22', volume: '15.6 млн' },
  'NFLX': { name: 'Netflix, Inc.', sector: 'Communication Services', basePrice: 685.00, annualVol: 0.34, drift: 0.17, pe: '41.2', beta: '1.30', volume: '4.2 млн' },
  'AMD': { name: 'Advanced Micro Devices', sector: 'Semiconductors', basePrice: 152.00, annualVol: 0.42, drift: 0.20, pe: '48.1', beta: '1.75', volume: '38.0 млн' },
  'INTC': { name: 'Intel Corporation', sector: 'Semiconductors', basePrice: 21.50, annualVol: 0.38, drift: 0.05, pe: '18.2', beta: '1.10', volume: '45.0 млн' },
  'JPM': { name: 'JPMorgan Chase & Co.', sector: 'Financial Services', basePrice: 214.00, annualVol: 0.20, drift: 0.12, pe: '12.1', beta: '1.08', volume: '9.8 млн' },
  'BAC': { name: 'Bank of America', sector: 'Financial Services', basePrice: 39.50, annualVol: 0.24, drift: 0.10, pe: '13.4', beta: '1.35', volume: '32.1 млн' },
  'JNJ': { name: 'Johnson & Johnson', sector: 'Healthcare', basePrice: 161.00, annualVol: 0.14, drift: 0.07, pe: '16.2', beta: '0.54', volume: '8.4 млн' },
  'LLY': { name: 'Eli Lilly and Company', sector: 'Healthcare', basePrice: 910.00, annualVol: 0.28, drift: 0.22, pe: '62.0', beta: '0.72', volume: '3.1 млн' },
  'WMT': { name: 'Walmart Inc.', sector: 'Consumer Defensive', basePrice: 74.00, annualVol: 0.16, drift: 0.10, pe: '29.5', beta: '0.51', volume: '18.0 млн' },
  'PG': { name: 'Procter & Gamble', sector: 'Consumer Defensive', basePrice: 169.50, annualVol: 0.15, drift: 0.08, pe: '27.4', beta: '0.45', volume: '7.5 млн' },
  'XOM': { name: 'Exxon Mobil Corporation', sector: 'Energy', basePrice: 118.00, annualVol: 0.22, drift: 0.09, pe: '14.2', beta: '0.95', volume: '16.4 млн' },
  'BTC-USD': { name: 'Bitcoin (BTC/USD)', sector: 'Cryptocurrency', basePrice: 64200.00, annualVol: 0.65, drift: 0.35, pe: 'N/A', beta: '2.85', volume: '28.4 млрд' },
  'BTC': { name: 'Bitcoin', sector: 'Cryptocurrency', basePrice: 64200.00, annualVol: 0.65, drift: 0.35, pe: 'N/A', beta: '2.85', volume: '28.4 млрд' },
  'ETH-USD': { name: 'Ethereum (ETH/USD)', sector: 'Cryptocurrency', basePrice: 2650.00, annualVol: 0.72, drift: 0.30, pe: 'N/A', beta: '3.10', volume: '14.2 млрд' },
  'ETH': { name: 'Ethereum', sector: 'Cryptocurrency', basePrice: 2650.00, annualVol: 0.72, drift: 0.30, pe: 'N/A', beta: '3.10', volume: '14.2 млрд' },
  'SOL-USD': { name: 'Solana (SOL/USD)', sector: 'Cryptocurrency', basePrice: 145.00, annualVol: 0.85, drift: 0.40, pe: 'N/A', beta: '3.45', volume: '3.8 млрд' },
  'SOL': { name: 'Solana', sector: 'Cryptocurrency', basePrice: 145.00, annualVol: 0.85, drift: 0.40, pe: 'N/A', beta: '3.45', volume: '3.8 млрд' },
};

export const getTickerProfile = (t = 'AAPL') => {
  const clean = String(t).trim().toUpperCase();
  if (KNOWN_TICKERS[clean]) return KNOWN_TICKERS[clean];
  
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) & 0xFFFFFFFF;
  }
  const absHash = Math.abs(hash);
  const basePrice = 25 + (absHash % 280) + ((absHash % 100) / 100);
  const annualVol = 0.18 + ((absHash % 25) / 100);
  const drift = 0.08 + ((absHash % 10) / 100);
  const pe = (12 + (absHash % 40) + 0.5).toFixed(1);
  const beta = (0.6 + ((absHash % 150) / 100)).toFixed(2);
  const volume = `${(5 + (absHash % 45)).toFixed(1)} млн`;
  
  return {
    name: `${clean} Corp.`,
    sector: 'Diversified Financials',
    basePrice: Number(basePrice.toFixed(2)),
    annualVol,
    drift,
    pe,
    beta,
    volume
  };
};

/**
 * Генератор точних розрахунків Монте-Карло (GBM) та графічних точок
 */
export const generateMockSimulation = (
  ticker = 'AAPL',
  horizon = 30,
  simulations = 1000,
  scenario = 'none',
  varConfidence = 0.95,
  riskFreeRatePct = 4.5
) => {
  const profile = getTickerProfile(ticker);
  const S0 = profile.basePrice; // Початкова ціна (остання історична точка)
  const annualVol = profile.annualVol || 0.22;
  const annualDrift = profile.drift || 0.12;
  const dt = 1.0 / 252.0;

  const historyLength = 120;
  const historicalPrices = new Array(historyLength);
  historicalPrices[historyLength - 1] = S0;

  // 1. Генерація 120 днів історичних даних назад від S0 за формулою GBM
  for (let i = historyLength - 2; i >= 0; i--) {
    const z = standardNormal();
    const driftTerm = (annualDrift - 0.5 * Math.pow(annualVol, 2)) * dt;
    const volTerm = annualVol * Math.sqrt(dt) * z;
    historicalPrices[i] = historicalPrices[i + 1] / Math.exp(driftTerm + volTerm);
  }

  const points = [];
  const now = new Date();
  
  // Якщо вибрано Backtesting (backtest), ми зміщуємо "сьогодні" на horizon днів у минуле
  const simHorizon = Math.max(1, Number(horizon) || 30);
  const isBacktest = scenario === 'backtest'; // Оскільки алгоритм ми передаємо через scenario або якщо він сам backtest
  const simStartIndex = isBacktest ? historyLength - simHorizon - 1 : historyLength - 1;
  const startSimulationS0 = historicalPrices[simStartIndex];

  // Формуємо історичні точки
  for (let i = 0; i < historyLength; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (historyLength - 1 - i));
    const dateStr = d.toISOString().split('T')[0];

    const close = Number(historicalPrices[i].toFixed(2));
    const prev = i > 0 ? historicalPrices[i - 1] : historicalPrices[0] * 0.998;
    const open = Number(prev.toFixed(2));
    const spread = Math.abs(close - open) + close * 0.004;
    const high = Number((Math.max(open, close) + spread * 0.6).toFixed(2));
    const low = Number((Math.min(open, close) - spread * 0.6).toFixed(2));

    const isBridge = i === simStartIndex;
    
    // В режимі backtest, історія закінчується раніше
    let historyVal = close;
    let actualVal = null;
    let forecastVal = null;

    if (isBacktest) {
        if (i > simStartIndex) {
            historyVal = null; // Це вже майбутнє відносно точки симуляції
            actualVal = close; // Реальні дані, які сталися
        }
    }
    
    if (isBridge) {
        forecastVal = close;
    }

    points.push({
      name: dateStr,
      history: historyVal,
      forecast: forecastVal,
      actual: actualVal,
      open,
      high,
      low,
      close
    });
  }

  // 2. Симуляція шляхів GBM Монте-Карло: S_t = S_{t-1} * exp((mu - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z)
  const numSim = Math.max(200, Math.min(Number(simulations) || 1000, 2000));
  const paths = [];

  for (let s = 0; s < numSim; s++) {
    const path = new Array(simHorizon + 1);
    path[0] = startSimulationS0; // Початкова ціна симуляції

    let current = startSimulationS0;
    for (let day = 1; day <= simHorizon; day++) {
      let mu = annualDrift;
      let sigma = annualVol;

      if (scenario === 'covid') {
        if (day === 5) { mu -= 0.60; sigma *= 2.2; }
      } else if (scenario === '2008') {
        if (day === 8) { mu -= 0.80; sigma *= 2.5; }
      } else if (scenario === 'dotcom') {
        if (day === 6) { mu -= 0.70; sigma *= 2.0; }
      }

      const z = standardNormal();
      const stepDrift = (mu - 0.5 * Math.pow(sigma, 2)) * dt;
      const stepVol = sigma * Math.sqrt(dt) * z;
      current = Math.max(0.01, current * Math.exp(stepDrift + stepVol));
      path[day] = current;
    }
    paths.push(path);
  }

  // 3. Знаходимо репрезентативну (медіанну) стохастичну траєкторію для реалістичного графіка
  const sortedPathsByFinal = paths
    .map((p, idx) => ({ idx, finalPrice: p[simHorizon] }))
    .sort((a, b) => a.finalPrice - b.finalPrice);
  const medianPathIdx = sortedPathsByFinal[Math.floor(sortedPathsByFinal.length / 2)].idx;
  const representativePath = paths[medianPathIdx];

  // 4. Формуємо прогнозні точки на графіку для кожного майбутнього дня
  const conf = Number(varConfidence) || 0.95;
  const lowerPercentile = (1.0 - conf) / 2.0;
  const upperPercentile = 1.0 - lowerPercentile;

  for (let day = 1; day <= simHorizon; day++) {
    const d = new Date(now);
    d.setDate(d.getDate() + day);
    const dateStr = d.toISOString().split('T')[0];

    const dayPrices = paths.map(p => p[day]).sort((a, b) => a - b);

    const lowerIdx = Math.max(0, Math.floor(dayPrices.length * lowerPercentile));
    const upperIdx = Math.min(dayPrices.length - 1, Math.floor(dayPrices.length * upperPercentile));

    const lowerBound = dayPrices[lowerIdx];
    const upperBound = dayPrices[upperIdx];
    const forecastVal = representativePath[day];

    const prevVal = representativePath[day - 1];
    const open = Number(prevVal.toFixed(2));
    const close = Number(forecastVal.toFixed(2));
    const spread = Math.abs(close - open) + close * 0.003;
    const high = Number((Math.max(open, close) + spread * 0.5).toFixed(2));
    const low = Number((Math.min(open, close) - spread * 0.5).toFixed(2));

    points.push({
      name: dateStr,
      history: null,
      forecast: Number(forecastVal.toFixed(2)),
      lowerBound: Number(lowerBound.toFixed(2)),
      upperBound: Number(upperBound.toFixed(2)),
      bb_lower: Number(lowerBound.toFixed(2)),
      bb_upper: Number(upperBound.toFixed(2)),
      open,
      high,
      low,
      close
    });
  }

  // 4. Розрахунок Очікуваної ціни, VaR та CVaR на кінець горизонту
  const finalPrices = paths.map(p => p[simHorizon]).sort((a, b) => a - b);
  const expectedPrice = Number((finalPrices.reduce((a, b) => a + b, 0) / finalPrices.length).toFixed(2));

  // VaR: 1-й перцентиль (для 99%) або 5-й перцентиль (для 95%)
  const alpha = 1.0 - conf;
  const varIdx = Math.max(0, Math.min(finalPrices.length - 1, Math.floor(finalPrices.length * alpha)));
  const pVar = finalPrices[varIdx];
  const varLoss = Number(Math.max(0, S0 - pVar).toFixed(2));

  // CVaR: середнє значення цін, що впали нижче рівня VaR
  const tailCount = Math.max(1, varIdx);
  const tailPrices = finalPrices.slice(0, tailCount);
  const pCvar = tailPrices.reduce((a, b) => a + b, 0) / tailPrices.length;
  const cvarLoss = Number(Math.max(0, S0 - pCvar).toFixed(2));

  // Збагачення індикаторами та розрахунок Шарпа і Волатильності на річній шкалі
  const enrichedPoints = enrichChartData(points);
  const metrics = calculateFinancialMetrics(enrichedPoints, riskFreeRatePct);

  // 5. Гістограма фінальних цін для графіка розподілу
  const minP = finalPrices[0];
  const maxP = finalPrices[finalPrices.length - 1];
  const binCount = 15;
  const binWidth = (maxP - minP) / binCount || 1;
  const histogramBins = [];

  for (let b = 0; b < binCount; b++) {
    const bMin = minP + b * binWidth;
    const bMax = bMin + binWidth;
    const mid = (bMin + bMax) / 2;
    const count = finalPrices.filter(p => p >= bMin && (b === binCount - 1 ? p <= bMax : p < bMax)).length;
    histogramBins.push({
      name: `$${mid.toFixed(1)}`,
      price: Number(mid.toFixed(2)),
      count,
      frequency: count,
      range: `$${bMin.toFixed(0)}-$${bMax.toFixed(0)}`
    });
  }

  const stockInfoArray = [
    { label: "Компанія", value: profile.name },
    { label: "Сектор", value: profile.sector },
    { label: "Поточна ціна (S₀)", value: `$${S0.toFixed(2)}` },
    { label: "Обсяг", value: profile.volume },
    { label: "52-тиж. макс.", value: `$${(S0 * 1.25).toFixed(2)}` },
    { label: "Бета-фактор", value: profile.beta },
    { label: "52-тиж. мін.", value: `$${(S0 * 0.75).toFixed(2)}` },
    { label: "Р/Е (Ц/П)", value: profile.pe }
  ];

  return {
    chartData: enrichedPoints,
    histogram: histogramBins,
    histogramBins,
    expectedPrice,
    valueAtRisk: varLoss,
    conditionalValueAtRisk: cvarLoss,
    volatility: metrics.volatility,
    sharpeRatio: metrics.sharpeRatio,
    maxDrawdown: metrics.maxDrawdown,
    expected_price: expectedPrice,
    var_5: varLoss,
    cvar_5: cvarLoss,
    sharpe_ratio: metrics.sharpeRatio,
    max_drawdown: metrics.maxDrawdown,
    stockInfo: stockInfoArray,
    stock_info: stockInfoArray
  };
};

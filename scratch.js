const points = [
  { history: 100 },
  { history: 105 },
  { history: 110 }, // today
  { forecast: 112 },
  { forecast: 115 }
];
const days = 2; // last 2 days of history
const historyPoints = points.filter(p => p.history !== undefined && p.history !== null);
const forecastPoints = points.filter(p => p.history === undefined || p.history === null);

const recentHistory = days > 0 ? historyPoints.slice(-days) : historyPoints;
const displayPoints = [...recentHistory, ...forecastPoints];
console.log(displayPoints);

import React from 'react';

const CorrelationMatrix = ({ matrix }) => {
  if (!matrix || Object.keys(matrix).length === 0) return null;

  const tickers = Object.keys(matrix);

  // Функція для фарбування комірок (зелений = позитивна кореляція, червоний = негативна)
  const getCellColor = (val) => {
    if (val === 1) return 'rgba(255, 255, 255, 0.05)'; // Діагональ (кореляція сама з собою)
    if (val > 0) return `rgba(52, 199, 89, ${val * 0.6})`; // Зелений (відтінок залежить від сили)
    return `rgba(255, 59, 48, ${Math.abs(val) * 0.6})`; // Червоний
  };

  return (
    <div style={{ backgroundColor: '#1C1C1E', borderRadius: '16px', padding: '20px', border: '1px solid #38383A', flex: 1, overflowX: 'auto', minWidth: '300px' }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '1px' }}>Матриця кореляцій</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '13px' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #38383A' }}></th>
            {tickers.map(t => <th key={t} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #38383A', color: '#8E8E93', fontWeight: 'normal' }}>{t}</th>)}
          </tr>
        </thead>
        <tbody>
          {tickers.map(rowTicker => (
            <tr key={rowTicker}>
              <td style={{ padding: '10px', fontWeight: 'bold', borderBottom: '1px solid #38383A', color: '#8E8E93' }}>{rowTicker}</td>
              {tickers.map(colTicker => {
                const val = matrix[rowTicker][colTicker];
                return (
                  <td key={colTicker} style={{ 
                    padding: '10px', textAlign: 'center', borderBottom: '1px solid #38383A',
                    backgroundColor: getCellColor(val), color: val === 1 ? '#8E8E93' : '#fff', fontWeight: '500'
                  }}>
                    {val.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CorrelationMatrix;
import React from 'react';
import styles from '../dashboard/css/CorrelationMatrix.module.css';

const CorrelationMatrix = ({ matrix }) => {
  if (!matrix || Object.keys(matrix).length === 0) return null;

  const tickers = Object.keys(matrix);

  // 🔥 Оновлені фірмові кольори Rizix (Смарагдовий та Червоний)
  const getCellColor = (val) => {
    if (val === 1) return 'rgba(255, 255, 255, 0.05)'; 
    // rgb(16, 185, 129) - це #10B981
    if (val > 0) return `rgba(16, 185, 129, ${val * 0.7})`; 
    // rgb(239, 68, 68) - це #EF4444
    return `rgba(239, 68, 68, ${Math.abs(val) * 0.7})`; 
  };

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.title}>Матриця кореляцій</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.matrixTable}>
          <thead className={styles.tableHead}>
            <tr>
              <th></th>
              {tickers.map(t => <th key={t}>{t}</th>)}
            </tr>
          </thead>
          <tbody>
            {tickers.map(rowTicker => (
              <tr key={rowTicker}>
                <td className={styles.rowHeader}>{rowTicker}</td>
                {tickers.map(colTicker => {
                  const val = matrix[rowTicker][colTicker];
                  return (
                    <td 
                      key={colTicker} 
                      className={styles.cell}
                      style={{ 
                        backgroundColor: getCellColor(val), 
                        color: val === 1 ? '#8E8E93' : '#fff'
                      }}
                      title={`Кореляція між ${rowTicker} та ${colTicker}: ${val.toFixed(2)}`}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CorrelationMatrix;
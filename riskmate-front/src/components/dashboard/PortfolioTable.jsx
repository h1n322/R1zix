import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from '../dashboard/css/PortfolioTable.module.css';

const PortfolioTable = ({ user, onLoadPortfolio }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "users", user.uid, "portfolios"), orderBy("updatedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPortfolios(data);
      } catch (error) {
        console.error("🚨 Помилка завантаження таблиці:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortfolios();
  }, [user]);

  // Хелпер для красивого форматування грошей ($1,234.56)
  const formatMoney = (val) => {
    if (val === undefined || val === null) return 'N/A';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!user) return null;

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.title}>Історія симуляцій</h3>
      
      {isLoading ? (
        <div className={styles.emptyState}>Завантаження даних...</div>
      ) : portfolios.length === 0 ? (
        // ⚡️ Правильний UX: показуємо користувачу, що тут БУДУТЬ його дані
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📁</div>
          <p>У вас ще немає збережених портфелів.</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Проведіть симуляцію та збережіть результати, щоб вони з'явилися тут.</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Тикер / Портфель</th>
              <th className={styles.th}>Модель</th>
              <th className={styles.th}>Очікувана ціна</th>
              <th className={styles.th}>Дата створення</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>Дія</th>
            </tr>
          </thead>
          <tbody>
            {portfolios.map((p) => (
              <tr key={p.id} className={styles.tr}>
                <td className={`${styles.td} ${styles.tickerCell}`}>
                  {/* Замінюємо коми на красиві пробіли, якщо це масив тикерів */}
                  {p.tickers?.replace(/,/g, ', ') || 'N/A'}
                </td>
                <td className={styles.td}>
                  {/* Красива плашка алгоритму */}
                  <span className={styles.algoBadge}>
                    {p.inputs?.algorithm || 'Monte Carlo'}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.priceCell}`}>
                  ${formatMoney(p.metrics?.expected_price)}
                </td>
                <td className={`${styles.td} ${styles.dateCell}`}>
                  {new Date(p.updatedAt).toLocaleDateString('uk-UA', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td className={styles.td} style={{ textAlign: 'right' }}>
                  <button 
                    onClick={() => onLoadPortfolio(p)} 
                    className={styles.openBtn}
                  >
                    Відкрити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PortfolioTable;
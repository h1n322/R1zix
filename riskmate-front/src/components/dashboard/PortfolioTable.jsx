import React, { useEffect, useState, useCallback } from 'react';
import styles from '../dashboard/css/PortfolioTable.module.css';
import { auth } from '../../firebase';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'riskmate_saved_portfolios';

const PortfolioTable = ({ user, onLoadPortfolio }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPortfolios = useCallback(async () => {
    setIsLoading(true);
    let localItems = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        localItems = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Помилка читання localStorage:", e);
    }

    if (!user) {
      setPortfolios(localItems);
      setIsLoading(false);
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setPortfolios(localItems);
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/portfolio", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const apiData = await response.json();
        // Об'єднуємо API-дані та локальні дані з дедуплікацією
        const combined = [...apiData];
        const apiIds = new Set(apiData.map(p => String(p.id)));
        
        for (const loc of localItems) {
          if (!apiIds.has(String(loc.id))) {
            combined.push(loc);
          }
        }
        combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setPortfolios(combined);
      } else {
        setPortfolios(localItems);
      }
    } catch (error) {
      console.warn("Бекенд недоступний, використовуються локальні збереження:", error);
      setPortfolios(localItems);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPortfolios();

    // Слухаємо подію збереження нового портфеля для миттєвого оновлення
    const handlePortfolioSaved = () => {
      fetchPortfolios();
    };

    window.addEventListener('riskmate_portfolio_saved', handlePortfolioSaved);
    window.addEventListener('storage', handlePortfolioSaved);

    return () => {
      window.removeEventListener('riskmate_portfolio_saved', handlePortfolioSaved);
      window.removeEventListener('storage', handlePortfolioSaved);
    };
  }, [fetchPortfolios]);

  // Видалення портфеля з локального сховища
  const handleDeletePortfolio = (id, e) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter(p => String(p.id) !== String(id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
      setPortfolios(prev => prev.filter(p => String(p.id) !== String(id)));
      toast.success("Портфель видалено з історії!");
    } catch (err) {
      console.error(err);
    }
  };

  // Хелпер для красивого форматування грошей ($1,234.56)
  const formatMoney = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSelect = (portfolio) => {
    if (onLoadPortfolio) {
      onLoadPortfolio(portfolio);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.cardContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 className={styles.title} style={{ margin: 0 }}>Історія симуляцій</h3>
        <span style={{ fontSize: '12px', color: '#8E8E93' }}>
          Всього записів: {portfolios.length}
        </span>
      </div>
      
      {isLoading ? (
        <div className={styles.emptyState}>Завантаження історії...</div>
      ) : portfolios.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📁</div>
          <p>У вас ще немає збережених симуляцій.</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Проведіть симуляцію та натисніть <b>"Зберегти"</b> у меню зліва, щоб зафіксувати результати.</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Тикер / Портфель</th>
              <th className={styles.th}>Модель</th>
              <th className={styles.th}>Очікувана ціна</th>
              <th className={styles.th}>Дата створення</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {portfolios.map((p) => (
              <tr key={p.id || p.createdAt} className={styles.tr}>
                <td className={`${styles.td} ${styles.tickerCell}`}>
                  {p.tickers?.replace(/,/g, ', ') || 'N/A'}
                </td>
                <td className={styles.td}>
                  <span className={styles.algoBadge}>
                    {p.algorithm?.toUpperCase() || 'GBM'}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.priceCell}`}>
                  ${formatMoney(p.expectedPrice ?? p.expected_price)}
                </td>
                <td className={`${styles.td} ${styles.dateCell}`}>
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString('uk-UA', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : 'Щойно'}
                </td>
                <td className={styles.td} style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button 
                    onClick={() => handleSelect(p)} 
                    className={styles.openBtn}
                    style={{ marginRight: '8px' }}
                    title="Завантажити цю симуляцію на дашборд"
                  >
                    Відкрити
                  </button>
                  <button 
                    onClick={(e) => handleDeletePortfolio(p.id, e)} 
                    className={styles.openBtn}
                    style={{ borderColor: '#ef4444', color: '#ef4444', padding: '6px 10px' }}
                    title="Видалити запис"
                  >
                    ✕
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
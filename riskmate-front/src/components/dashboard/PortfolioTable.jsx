import React, { useEffect, useState } from 'react';
import { collection, setDoc,addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase'; // Перевір правильність шляху

const PortfolioTable = ({ user, onLoadPortfolio }) => {
  const [portfolios, setPortfolios] = useState([]);

  useEffect(() => {
    const fetchPortfolios = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "users", user.uid, "portfolios"), orderBy("updatedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPortfolios(data);
      } catch (error) {
        console.error("Помилка завантаження таблиці:", error);
      }
    };
    fetchPortfolios();
  }, [user]);

  if (!user || portfolios.length === 0) return null;

  return (
    <div className="card" style={{ width: '100%', padding: '24px', marginBottom: '40px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#fff' }}>Збережені портфелі</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #38383A', textAlign: 'left', color: '#8E8E93' }}>
            <th style={{ padding: '12px' }}>Тикер</th>
            <th style={{ padding: '12px' }}>Алгоритм</th>
            <th style={{ padding: '12px' }}>Очікувана ціна</th>
            <th style={{ padding: '12px' }}>Дата збереження</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Дія</th>
          </tr>
        </thead>
        <tbody>
          {portfolios.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #38383A' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.tickers}</td>
              <td style={{ padding: '12px' }}>{p.inputs?.algorithm}</td>
              <td style={{ padding: '12px', color: '#34C759' }}>${p.metrics?.expected_price}</td>
              <td style={{ padding: '12px' }}>{new Date(p.updatedAt).toLocaleDateString()}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                <button 
                  onClick={() => onLoadPortfolio(p)} 
                  style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#0A84FF', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  Відкрити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTable;
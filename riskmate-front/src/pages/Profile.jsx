import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import styles from './PagesStyles/Profile.module.css'; // Підключаємо модульні стилі

const Profile = ({ user }) => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchPortfolios();
  }, [user, navigate]);

  const fetchPortfolios = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "portfolios"), orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPortfolios(data);
    } catch (error) {
      toast.error("Не вдалося завантажити історію");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
    toast.success('Ви вийшли з акаунту');
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  // Хелпер для красивого форматування грошей
  const formatMoney = (val) => {
    if (val === undefined || val === null) return '0.00';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!user) return null;

  return (
    <div className={styles.pageContainer}>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#0B0E14', color: '#f8fafc', border: '1px solid #1F2937' }
      }}/>
      <div className={styles.contentWrapper}>
        
        {/* Навігація */}
        <div className={styles.headerNav}>
          <button onClick={() => navigate('/dashboard')} className={styles.backBtn}>
            <span>←</span> У Дашборд
          </button>
        </div>

        <h1 className={styles.pageTitle}>Мій профіль</h1>

        {/* Картка користувача */}
        <div className={styles.userCard}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : getInitials(user.email)}
            </div>
            <div>
              <h2 className={styles.userName}>{user.displayName || 'Інвестор RiskMate'}</h2>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Вийти з акаунту
          </button>
        </div>

        {/* Збережені портфелі */}
        <h2 className={styles.sectionTitle}>Історія збережених симуляцій</h2>
        
        {loading ? (
          <p className={styles.loadingText}>Завантаження даних...</p>
        ) : portfolios.length > 0 ? (
          <div className={styles.portfolioGrid}>
            {portfolios.map((port) => (
              <div 
                key={port.id} 
                onClick={() => {
                  toast.success('Перейдіть в Дашборд та натисніть "Завантажити"');
                  navigate('/dashboard');
                }}
                className={styles.portfolioCard}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.tickerBadge}>
                    {port.tickers || 'N/A'}
                  </span>
                  <span className={styles.dateBadge}>
                    {new Date(port.updatedAt).toLocaleDateString('uk-UA', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className={styles.metricsRow}>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Очікувана ціна:</span>
                    <span className={styles.metricValue}>
                      ${formatMoney(port.metrics?.expected_price)}
                    </span>
                  </div>
                  <div className={`${styles.metricBlock} ${styles.metricBlockRight}`}>
                    <span className={styles.metricLabel}>VaR (Ризик 95%):</span>
                    <span className={styles.metricRisk}>
                      ${formatMoney(port.metrics?.var_5)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <p className={styles.emptyText}>У вас ще немає збережених симуляцій.</p>
            <button onClick={() => navigate('/dashboard')} className={styles.actionBtn}>
              Зробити перший розрахунок
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
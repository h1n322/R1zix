import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';  
import { onAuthStateChanged, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { IoTrendingUp, IoShieldCheckmark, IoDocumentText } from "react-icons/io5";
import AuthModal from '../components/shared/AuthModal';
import styles from '../components/../pages/PagesStyles/Landing.module.css';

const Landing = () => {
  const [marketData, setMarketData] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const navigate = useNavigate();
  const navRef = useRef(null);
  
  // Динамічний стиль для індикатора (його залишаємо інлайн, бо координати динамічні)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const handleMouseEnter = (e) => {
    if (!navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = e.target.getBoundingClientRect();

    setIndicatorStyle({
      left: itemRect.left - navRect.left,
      width: itemRect.width,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  const navItems = [
    { id: 'market', label: 'Ринок', action: () => scrollToSection('market') },
    { id: 'features', label: 'Функціонал', action: () => scrollToSection('features') },
    { id: 'guide', label: 'Довідник', action: () => navigate('/guide') },
    { id: 'methodology', label: 'Методологія', action: () => navigate('/methodology') },
    { id: 'pricing', label: 'Тарифи', action: () => navigate('/pricing') },
    { id: 'about', label: 'Про нас', action: () => scrollToSection('about') }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const resp = await fetch('/api/market-overview');
        const data = await resp.json();
        setMarketData(data);
      } catch (error) {
        console.error("Помилка завантаження даних ринку:", error);
      }
    };
    fetchMarketData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Ви успішно вийшли з акаунту');
    } catch (error) {
      console.error("Помилка виходу:", error);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMainAction = () => {
    if (user) {
      navigate('/dashboard'); 
    } else {
      setIsAuthOpen(true); 
    }
  };

  return (
    <div className={styles.landingWrapper}>
      
      {/* ФОН */}
      <div className={styles.animatedBg} />

      {/* КОНТЕНТ */}
      <div className={styles.contentWrapper}>
        
        {/* --- HEADER --- */}
        <header className={styles.header}>
          
          {/* Логотип видалено за твоїм бажанням */}

          <nav ref={navRef} onMouseLeave={handleMouseLeave} className={styles.nav}>
            
            <div 
              className={styles.navIndicator} 
              style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px`, opacity: indicatorStyle.opacity }} 
            />

            {navItems.map((item) => (
              <span 
                key={item.id}
                onClick={item.action}
                onMouseEnter={handleMouseEnter}
                className={`${styles.navItem} ${['guide', 'methodology', 'pricing'].includes(item.id) ? styles.navItemBold : ''}`}
              >
                {item.label}
              </span>
            ))}

            <a href="/RiskMate-Demo.exe" download className={styles.btnDemo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Завантажити Demo
            </a>

            {user ? (
              <div className={styles.userBlock}>
                <div onClick={() => navigate('/profile')} className={styles.userProfile} title="Перейти в Особистий кабінет">
                  <div className={styles.userAvatar}>
                    {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                  </div>
                  <span className={styles.userName}>
                    {user.displayName || user.email?.split('@')[0] || 'Користувач'}
                  </span>
                </div>
                <div style={{ height: '22px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Вийти
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className={styles.btnLogin}>
                Увійти
              </button>
            )}
          </nav>
        </header>

        {/* --- ГОЛОВНИЙ КОНТЕНТ --- */}
        <div className={styles.mainContainer}>
          
          {/* HERO */}
          <div id="hero" className={styles.hero}>
            <h1 className={styles.heroTitle}>RiskMate</h1>
            <p className={styles.heroSubtitle}>
              Професійний інструмент для прогнозування фінансових ризиків та аналізу портфелів за допомогою симуляцій Монте-Карло та Штучного Інтелекту.
            </p>
            <button onClick={handleMainAction} className={styles.btnMain}>
              Розпочати Аналіз Ризиків
            </button>
          </div>

          {/* MARKET */}
          <div id="market" className={styles.marketSection}>
            <h3 style={{ color: '#e2e8f0', marginBottom: '50px', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <div style={{ height: '1px', width: '80px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
              Ринок у реальному часі
              <div style={{ height: '1px', width: '80px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
            </h3>

            <div className={styles.marketGrid}>
              {marketData.length > 0 ? marketData.map((item) => {
                const isPositive = item.isUp || (item.change && item.change.includes('+'));
                const color = isPositive ? '#10B981' : '#EF4444'; 
                const bgColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                const icon = isPositive ? '↗' : '↘';
                const cardHoverClass = isPositive ? styles.marketCardUp : styles.marketCardDown;

                return (
                  <div key={item.ticker} className={`${styles.marketCard} ${cardHoverClass}`}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: color }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span style={{ color: '#f8fafc', fontSize: '1.3rem', fontWeight: '800', letterSpacing: '0.5px' }}>{item.ticker}</span>
                      <span style={{ backgroundColor: bgColor, color: color, padding: '6px 10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {icon} {item.change}
                      </span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px' }}>
                      ${item.price}
                    </div>
                  </div>
                )
              }) : (
                <div style={{ color: '#cbd5e1', textAlign: 'center', padding: '40px', fontSize: '1.2rem', backgroundColor: 'rgba(15,23,42,0.5)', borderRadius: '16px' }}>
                  <span style={{ display: 'inline-block', animation: 'pulse 2s infinite' }}>⏳ Встановлення з'єднання з біржею...</span>
                </div>
              )}
            </div>
          </div>

          {/* FEATURES */}
          <div id="features" style={{ width: '100%', maxWidth: '1100px', marginBottom: '120px', paddingTop: '40px' }}>
            <h2 className={styles.sectionTitle}>Чому обирають RiskMate?</h2>
            
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <IoTrendingUp size={45} color="#3B82F6" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px', color: '#f8fafc' }}>Симуляції Монте-Карло</h3>
                <p style={{ color: '#8E8E93', lineHeight: '1.6', fontSize: '1rem' }}>Створюйте тисячі стохастичних сценаріїв розвитку цін на активи, використовуючи математичну модель геометричного броунівського руху.</p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon} style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)' }}>
                  <IoShieldCheckmark size={45} color="#8B5CF6" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px', color: '#f8fafc' }}>Метрики Ризику</h3>
                <p style={{ color: '#8E8E93', lineHeight: '1.6', fontSize: '1rem' }}>Автоматичний розрахунок Value at Risk (VaR), Expected Shortfall (CVaR), волатильності та коефіцієнта Шарпа для вашого портфеля.</p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <IoDocumentText size={45} color="#10B981" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px', color: '#f8fafc' }}>ШІ та Звіти</h3>
                <p style={{ color: '#8E8E93', lineHeight: '1.6', fontSize: '1rem' }}>Прогнозування за допомогою нейромереж LSTM, оптимізація за Марковіцом та експорт детальних аналітичних звітів у PDF та CSV.</p>
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <div id="about" style={{ width: '100%', maxWidth: '900px', marginBottom: '60px', paddingTop: '40px', textAlign: 'center' }}>
            <h2 className={styles.sectionTitle}>Про проєкт</h2>
            <div className={styles.aboutBox}>
              <div style={{ position: 'absolute', top: '-1px', left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, #3B82F6, transparent)' }}></div>
              <p style={{ color: '#e2e8f0', lineHeight: '1.9', fontSize: '1.15rem', margin: 0 }}>
                RiskMate — це інноваційний науково-дослідницький проєкт, створений для участі у конкурсі-захисті Малої академії наук України (МАН). 
                Головна мета платформи — демократизувати доступ до складних інструментів фінансової аналітики. Ми поєднали класичні математичні моделі (GBM, оптимізація Марковіца) з сучасними алгоритмами штучного інтелекту, загорнувши це у швидкий, безпечний та інтуїтивно зрозумілий веб-інтерфейс.
              </p>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: '500', margin: '0 0 10px 0' }}>RiskMate © 2026. Проєкт для МАН України.</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Дизайн та розробка: <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>Максим Тиванюк</span></p>
        </footer>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    </div>
  );
};

export default Landing;
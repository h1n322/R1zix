import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';  
import { onAuthStateChanged, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { IoTrendingUp, IoShieldCheckmark, IoDocumentText } from "react-icons/io5";
import AuthModal from '../components/shared/AuthModal';

const Landing = () => {
  const [marketData, setMarketData] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const navigate = useNavigate();
  
  const navRef = useRef(null);
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
        const resp = await fetch('http://localhost:8000/api/market-overview');
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
  <div style={{ minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
    
    <style>
      {`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}
    </style>

    {/* ФОН */}
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      background: 'linear-gradient(-45deg, #020617, #3730a3, #0f172a, #4c1d95, #020617)',
      backgroundSize: '400% 400%',
      animation: 'gradientMove 15s ease infinite',
      willChange: 'background-position',     // ← підказка браузеру
      transform: 'translateZ(0)',       // ← підказка браузеру  
    }} />

    {/* КОНТЕНТ */}
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        
        {/* --- HEADER --- */}
        <header className="header-mobile" style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '70px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 40px', backgroundColor: 'rgba(2, 6, 23, 0.5)', 
          backdropFilter: 'blur(16px)', zIndex: 1000, borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div 
            onClick={() => scrollToSection('hero')}
            style={{ fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer', background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            <h1 className="hero-title">RiskMate</h1>
          </div>

          <nav 
            ref={navRef}
            onMouseLeave={handleMouseLeave}
            style={{ display: 'flex', gap: '15px', alignItems: 'center', position: 'relative' }}
          >
            <div className="nav-links-desktop" style={{
              position: 'absolute', top: 0, bottom: 0, left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px`,
              backgroundColor: 'rgba(96, 165, 250, 0.2)', borderRadius: '12px', opacity: indicatorStyle.opacity,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'none', zIndex: 0
            }} />

            {navItems.map((item) => (
              <span className="hide-on-mobile"
                key={item.id}
                onClick={item.action}
                onMouseEnter={handleMouseEnter}
                style={{ 
                  cursor: 'pointer', color: '#cbd5e1', fontSize: '1rem', 
                  fontWeight: ['guide', 'methodology', 'pricing'].includes(item.id) ? 'bold' : 'normal',
                  padding: '8px 16px', position: 'relative', zIndex: 1, transition: 'color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.color = '#60a5fa'}
                onMouseOut={(e) => e.target.style.color = '#cbd5e1'}
              >
                {item.label}
              </span>
            ))}

            <a 
              href="/RiskMate-Demo.exe" 
              download 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', 
                color: '#60a5fa', backgroundColor: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)', 
                borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s', marginLeft: '10px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Завантажити Demo
            </a>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '6px 16px 6px 6px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', marginLeft: '10px', position: 'relative', zIndex: 1, backdropFilter: 'blur(5px)' }}>
                <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} title="Перейти в Особистий кабінет">
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 2px 5px rgba(79, 70, 229, 0.5)' }}>
                    {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                  </div>
                  <span style={{ color: '#f8fafc', fontSize: '15px', fontWeight: '600' }}>
                    {user.displayName || user.email?.split('@')[0] || 'Користувач'}
                  </span>
                </div>
                <div style={{ height: '22px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }} onMouseOver={(e) => e.target.style.color = '#ef4444'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
                  Вийти
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                style={{ 
                  padding: '10px 24px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: 'white', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)', transition: 'all 0.2s', marginLeft: '10px', position: 'relative', zIndex: 1
                }}
                onMouseOver={(e) => { e.target.style.backgroundColor = '#4338ca'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = '#4f46e5'; e.target.style.transform = 'translateY(0)'; }}
              >
                Увійти
              </button>
            )}
          </nav>
        </header>

        {/* --- ГОЛОВНИЙ КОНТЕНТ --- */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '140px 20px 60px' }}>
          
          {/* HERO */}
          <div id="hero" style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '750px' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '20px', background: 'linear-gradient(135deg, #60a5fa, #d8b4fe, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', dropShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
              RiskMate
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#e2e8f0', marginBottom: '40px', lineHeight: '1.7', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Професійний інструмент для прогнозування фінансових ризиків та аналізу портфелів за допомогою симуляцій Монте-Карло та Штучного Інтелекту.
            </p>
            <button 
              onClick={handleMainAction} 
              style={{ padding: '16px 36px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#4f46e5', color: 'white', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.5)', transition: 'all 0.3s' }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#4338ca'; e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 15px 35px rgba(79, 70, 229, 0.6)'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = '#4f46e5'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.5)'; }}
            >
              Розпочати Аналіз Ризиків
            </button>
          </div>

          {/* MARKET */}
          <div id="market" style={{ width: '100%', maxWidth: '1200px', marginBottom: '120px', paddingTop: '40px' }}>
            <h3 style={{ color: '#e2e8f0', marginBottom: '50px', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              <div style={{ height: '1px', width: '80px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
              Ринок у реальному часі
              <div style={{ height: '1px', width: '80px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '25px', padding: '0 10px' }}>
              {marketData.length > 0 ? marketData.map((item) => {
                const isPositive = item.isUp || (item.change && item.change.includes('+'));
                const color = isPositive ? '#10b981' : '#f43f5e'; 
                const bgColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';
                const icon = isPositive ? '↗' : '↘';

                return (
                  <div key={item.ticker} style={{ 
                    width: '240px', flexShrink: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
                    backdropFilter: 'blur(16px)',
                    padding: '25px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.boxShadow = `0 15px 30px -10px ${color}`;
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                  }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: color }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span style={{ color: '#f8fafc', fontSize: '1.3rem', fontWeight: '800', letterSpacing: '0.5px' }}>{item.ticker}</span>
                      <span style={{ backgroundColor: bgColor, color: color, padding: '6px 10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {icon} {item.change}
                      </span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                      ${item.price}
                    </div>
                  </div>
                )
              }) : (
                <div style={{ color: '#cbd5e1', textAlign: 'center', gridColumn: '1 / -1', padding: '40px', fontSize: '1.2rem', backgroundColor: 'rgba(15,23,42,0.5)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                  <span style={{ display: 'inline-block', animation: 'pulse 2s infinite' }}>⏳ Встановлення з'єднання з біржею...</span>
                </div>
              )}
            </div>
          </div>

          {/* FEATURES */}
          <div id="features" style={{ width: '100%', maxWidth: '1100px', marginBottom: '120px', paddingTop: '40px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: '800', marginBottom: '50px', color: '#f8fafc', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Чому обирають RiskMate?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', padding: '40px 30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transition: 'transform 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={(e)=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ marginBottom: '20px', display: 'inline-block', padding: '15px', backgroundColor: 'rgba(96, 165, 250, 0.1)', borderRadius: '50%' }}><IoTrendingUp size={45} color="#60a5fa" /></div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px', color: '#f8fafc' }}>Симуляції Монте-Карло</h3>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '1rem' }}>Створюйте тисячі стохастичних сценаріїв розвитку цін на активи, використовуючи математичну модель геометричного броунівського руху.</p>
              </div>

              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', padding: '40px 30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transition: 'transform 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={(e)=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ marginBottom: '20px', display: 'inline-block', padding: '15px', backgroundColor: 'rgba(167, 139, 250, 0.1)', borderRadius: '50%' }}><IoShieldCheckmark size={45} color="#a78bfa" /></div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px', color: '#f8fafc' }}>Метрики Ризику</h3>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '1rem' }}>Автоматичний розрахунок Value at Risk (VaR), Expected Shortfall (CVaR), волатильності та коефіцієнта Шарпа для вашого портфеля.</p>
              </div>

              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', padding: '40px 30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transition: 'transform 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={(e)=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ marginBottom: '20px', display: 'inline-block', padding: '15px', backgroundColor: 'rgba(52, 211, 153, 0.1)', borderRadius: '50%' }}><IoDocumentText size={45} color="#34d399" /></div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px', color: '#f8fafc' }}>ШІ та Звіти</h3>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '1rem' }}>Прогнозування за допомогою нейромереж LSTM, оптимізація за Марковіцом та експорт детальних аналітичних звітів у PDF та CSV.</p>
              </div>

            </div>
          </div>

          {/* ABOUT */}
          <div id="about" style={{ width: '100%', maxWidth: '900px', marginBottom: '60px', paddingTop: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px', color: '#f8fafc', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Про проєкт</h2>
            <div style={{ position: 'relative', padding: '40px', borderRadius: '24px', backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, #818cf8, transparent)' }}></div>
              
              <p style={{ color: '#e2e8f0', lineHeight: '1.9', fontSize: '1.15rem', margin: 0 }}>
                RiskMate — це інноваційний науково-дослідницький проєкт, створений для участі у конкурсі-захисті Малої академії наук України (МАН). 
                Головна мета платформи — демократизувати доступ до складних інструментів фінансової аналітики. Ми поєднали класичні математичні моделі (GBM, оптимізація Марковіца) з сучасними алгоритмами штучного інтелекту, загорнувши це у швидкий, безпечний та інтуїтивно зрозумілий веб-інтерфейс.
              </p>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '40px 20px', textAlign: 'center', backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(10px)' }}>
          <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: '500', margin: '0 0 10px 0' }}>RiskMate © 2026. Проєкт для МАН України.</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Дизайн та розробка: <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>Максим Тиванюк</span></p>
        </footer>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    </div>
  );
};

export default Landing;
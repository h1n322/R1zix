import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';

// Додали onClick у пропси
const PricingCard = ({ title, price, features, isPopular, buttonText, onClick }) => {
  return (
    <div style={{
      backgroundColor: isPopular ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(10px)',
      padding: '40px 30px',
      borderRadius: '24px',
      border: isPopular ? '2px solid #3b82f6' : '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'default',
      width: '100%',
      maxWidth: '350px',
      boxShadow: isPopular ? '0 10px 30px -10px rgba(59, 130, 246, 0.5)' : 'none'
    }}
    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; }}
    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {isPopular && (
        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Найпопулярніший
        </div>
      )}
      
      <h3 style={{ color: '#f8fafc', fontSize: '1.5rem', marginBottom: '15px', marginTop: 0 }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '30px' }}>
        <span style={{ fontSize: '3rem', fontWeight: '800', color: isPopular ? '#3b82f6' : '#f8fafc' }}>{price}</span>
        {price !== 'Custom' && <span style={{ color: '#94a3b8', marginLeft: '5px' }}>/ міс</span>}
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', flexGrow: 1 }}>
        {features.map((feature, index) => (
          <li key={index} style={{ color: '#cbd5e1', marginBottom: '15px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
            <span style={{ lineHeight: '1.4' }}>{feature}</span>
          </li>
        ))}
      </ul>

      <button 
        onClick={onClick} // Тепер кнопка викликає передану функцію
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: isPopular ? 'none' : '1px solid #475569',
          backgroundColor: isPopular ? '#3b82f6' : '#1e293b',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => { e.target.style.backgroundColor = isPopular ? '#2563eb' : '#334155'; }}
        onMouseOut={(e) => { e.target.style.backgroundColor = isPopular ? '#3b82f6' : '#1e293b'; }}
      >
        {buttonText}
      </button>
    </div>
  );
};

const Pricing = () => {
  const navigate = useNavigate();

  // ВСТАВ СЮДИ СВОЄ ПОСИЛАННЯ ВІД STRIPE
  const STRIPE_PRO_LINK = "https://buy.stripe.com/test_9B600cfMQh10dOKgiUgnK00"; 

  const handleProPlan = () => {
    window.open(STRIPE_PRO_LINK, '_blank');
  };

  const handleBasicPlan = () => {
    navigate('/dashboard'); // Повертаємо безкоштовного користувача в кабінет
  };

  const handleEnterprisePlan = () => {
    window.location.href = "mailto:support@riskmate.com?subject=Enterprise Plan Inquiry";
  };

  return (
    <PageTransition>
      <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '60px 20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: '40px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}
          >
            <span>←</span> Повернутися в кабінет
          </button>

          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Тарифи RiskMate
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
              Оберіть план, який найкраще підходить для ваших інвестиційних потреб. Від базового аналізу до професійних нейромереж.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px' }}>
            <PricingCard 
              title="Basic" 
              price="$0" 
              features={['До 10 симуляцій на день', 'Базові показники (VaR 95%)', 'Історичні дані (до 2 років)', 'Стандартний список акцій']}
              buttonText="Почати безкоштовно"
              onClick={handleBasicPlan}
            />
            <PricingCard 
              title="Pro Analyst" 
              price="$15" 
              isPopular={true}
              features={['Безлімітні симуляції', 'Розширені метрики (CVaR, Sharpe)', 'Експорт звітів у PDF та CSV', 'Історичні дані до 10 років', 'Створення власного Watchlist']}
              buttonText="Оформити підписку"
              onClick={handleProPlan} // Клік веде на Stripe
            />
            <PricingCard 
              title="Enterprise" 
              price="Custom" 
              features={['Прогнозування через AI (LSTM)', 'Доступ до RiskMate API', 'Інтеграція з вашим брокером', 'Персональний менеджер', 'Окрема хмарна інфраструктура']}
              buttonText="Зв'язатися з нами"
              onClick={handleEnterprisePlan}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Pricing;
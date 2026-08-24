import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';
import styles from './PagesStyles/Pricing.module.css';

// Чистий компонент картки
const PricingCard = ({ title, price, features, isPopular, buttonText, onClick }) => {
  return (
    <div className={`${styles.card} ${isPopular ? styles.cardPopular : ''}`}>
      {isPopular && (
        <div className={styles.popularBadge}>
          Найпопулярніший
        </div>
      )}
      
      <h3 className={styles.cardTitle}>{title}</h3>
      
      <div className={styles.priceWrapper}>
        <span className={`${styles.price} ${isPopular ? styles.pricePopular : ''}`}>
          {price}
        </span>
        {price !== 'Custom' && <span className={styles.pricePeriod}>/ міс</span>}
      </div>

      <ul className={styles.featuresList}>
        {features.map((feature, index) => (
          <li key={index} className={styles.featureItem}>
            <span className={styles.checkIcon}>✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button 
        onClick={onClick} 
        className={`${styles.actionBtn} ${isPopular ? styles.btnPro : styles.btnBasic}`}
      >
        {buttonText}
      </button>
    </div>
  );
};

const Pricing = ({ user }) => {
  const navigate = useNavigate();

  const handleProPlan = async () => {
    if (!user) {
      navigate('/?login=true'); // Or whatever the login logic is
      return;
    }
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Payment setup failed:", e);
    }
  };

  const handleBasicPlan = () => {
    navigate('/dashboard'); 
  };

  const handleEnterprisePlan = () => {
    window.location.href = "mailto:support@riskmate.com?subject=Enterprise Plan Inquiry";
  };

  return (
    <PageTransition>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          
          <button onClick={() => navigate('/dashboard')} className={styles.backBtn}>
            <span>←</span> Повернутися в кабінет
          </button>

          <div className={styles.headerText}>
            <h1 className={styles.mainTitle}>Тарифи RiskMate</h1>
            <p className={styles.subtitle}>
              Оберіть план, який найкраще підходить для ваших інвестиційних потреб. Від базового аналізу до професійних нейромереж.
            </p>
          </div>

          <div className={styles.cardsGrid}>
            <PricingCard 
              title="Basic" 
              price="$0" 
              features={[
                'До 10 симуляцій на день', 
                'Базові показники (VaR 95%)', 
                'Історичні дані (до 2 років)', 
                'Стандартний список акцій'
              ]}
              buttonText="Почати безкоштовно"
              onClick={handleBasicPlan}
            />
            <PricingCard 
              title="Pro Analyst" 
              price="$15" 
              isPopular={true}
              features={[
                'Безлімітні симуляції', 
                'Розширені метрики (CVaR, Sharpe)', 
                'Експорт звітів у PDF та CSV', 
                'Історичні дані до 10 років', 
                'Створення власного Watchlist'
              ]}
              buttonText="Оформити підписку"
              onClick={handleProPlan}
            />
            <PricingCard 
              title="Enterprise" 
              price="Custom" 
              features={[
                'Прогнозування через AI (LSTM)', 
                'Доступ до RiskMate API', 
                'Інтеграція з вашим брокером', 
                'Персональний менеджер', 
                'Окрема хмарна інфраструктура'
              ]}
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
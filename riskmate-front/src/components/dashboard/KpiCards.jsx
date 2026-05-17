import React, { useState } from 'react';
import CountUp from 'react-countup';
// Імпортуємо стилі як об'єкт
import styles from './../dashboard/css/KpiCards.module.css'; 

// Компонент іконки з підказкою
const InfoIcon = ({ text }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!text) return null;

  return (
    <div 
      className={styles.infoIconWrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={styles.infoIconSymbol}>ⓘ</span>
      
      {isHovered && (
        <div className={styles.tooltip}>
          {text}
          <div className={styles.tooltipArrowOuter}></div>
          <div className={styles.tooltipArrowInner}></div>
        </div>
      )}
    </div>
  );
};

// Компонент однієї картки
const KpiCard = ({ title, value, prefix = "$", suffix = "", color = "#f8fafc", tooltip }) => {
  const numericValue = Number(value) || 0;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>
        {title}
        <InfoIcon text={tooltip} /> 
      </h3>
      {/* Динамічні кольори та підсвітку залишаємо інлайново, бо вони змінюються для кожної картки */}
      <div 
        className={styles.cardValue} 
        style={{ color: color, textShadow: `0 0 20px ${color}40`, fontWeight: '800' }}
      >
        <CountUp 
          end={numericValue} 
          decimals={2} 
          duration={2} 
          separator="," 
          prefix={prefix} 
          suffix={suffix} 
          preserveValue={true} 
        />
      </div>
    </div>
  );
};

const KpiCards = ({ metrics, varConf }) => {
  const confLevel = varConf ? (varConf * 100).toFixed(0) : 95;
  const varTitle = `Максимальний ризик (VaR ${confLevel}%)`;
  
  return (
    <div className={styles.container}>
      <KpiCard 
        title="Очікувана ціна активу" 
        value={metrics?.expected_price} 
        color="#10b981"
        tooltip="Найбільш ймовірна ціна активу в кінці обраного періоду, розрахована як середнє значение всіх симуляцій."
      />
      <KpiCard 
        title={varTitle} 
        value={Math.abs(metrics?.var_5 || 0)} 
        color="#ef4444"
        tooltip={`З імовірністю ${confLevel}% ваші збитки не перевищать цю суму на обраному проміжку часу.`}
      />
      <KpiCard 
        title="Екстремальний ризик (CVaR)" 
        value={Math.abs(metrics?.cvar_5 || 0)} 
        color="#f97316"
        tooltip="Середній очікуваний збиток у найгірших 5% сценаріїв (коли ринок пробиває рівень VaR)."
      />
      <KpiCard 
        title="Історична волатильність" 
        value={metrics?.volatility || 0}
        prefix="" 
        suffix="%" 
        color="#3b82f6"
        tooltip="Показник того, наскільки сильно коливалася ціна активу в минулому. Чим вище %, тим ризикованіший актив."
      />
      <KpiCard 
        title="Коефіцієнт Шарпа" 
        value={metrics?.sharpe_ratio || 0}
        prefix="" 
        color={(metrics?.sharpe_ratio || 0) >= 0 ? "#a855f7" : "#ef4444"}
        tooltip="Покажує дохідність на одиницю ризику. Значення > 1 — добре, > 2 — відмінно, < 0 — актив гірший за безризиковий."
      />
      <KpiCard 
        title="Макс. просадка" 
        value={Math.abs(metrics?.max_drawdown || 0)}
        prefix="" 
        suffix="%" 
        color="#ec4899"
        tooltip="Найбільше падіння ціни від пікового значення до мінімуму в історичних даних. Чим менше, тим стабільніший актив."
      />
    </div>
  );
};

export default KpiCards;
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

const KpiCards = ({ metrics, varConf, algorithm }) => {
  const confLevel = varConf ? (varConf * 100).toFixed(0) : 95;
  const varTitle = `Максимальний ризик (VaR ${confLevel}%)`;
  
  const expectedPrice = metrics?.expected_price ?? metrics?.expectedPrice ?? 0;
  const var5 = metrics?.var_5 ?? metrics?.valueAtRisk ?? 0;
  const cvar5 = metrics?.cvar_5 ?? metrics?.conditionalValueAtRisk ?? 0;
  const rawVol = Number(metrics?.volatility ?? metrics?.annualVolatility ?? 0);
  const volatility = (rawVol > 0 && rawVol <= 1.0) ? rawVol * 100 : rawVol;
  const sharpeRatio = metrics?.sharpe_ratio ?? metrics?.sharpeRatio ?? 0;
  const maxDrawdown = metrics?.max_drawdown ?? metrics?.maxDrawdown ?? 0;

  const isMarkowitz = algorithm === 'markowitz';

  return (
    <div className={styles.container}>
      <KpiCard 
        title={isMarkowitz ? "Очікувана дохідність" : "Очікувана ціна активу"} 
        value={expectedPrice} 
        prefix={isMarkowitz ? "" : "$"}
        suffix={isMarkowitz ? "%" : ""}
        color="#10b981"
        tooltip={isMarkowitz ? "Середньорічна очікувана дохідність оптимізованого портфеля." : "Найбільш ймовірна ціна активу в кінці обраного періоду, розрахована як середнє значення всіх симуляцій."}
      />
      <KpiCard 
        title={varTitle} 
        value={Math.abs(var5)} 
        prefix={isMarkowitz ? "" : "$"}
        color="#ef4444"
        tooltip={`З імовірністю ${confLevel}% ваші збитки не перевищать цю суму на обраному проміжку часу.`}
      />
      <KpiCard 
        title="Екстремальний ризик (CVaR)" 
        value={Math.abs(cvar5)} 
        prefix={isMarkowitz ? "" : "$"}
        tooltip="Середній очікуваний збиток у найгірших 5% сценаріїв (коли ринок пробиває рівень VaR)."
      />
      <KpiCard 
        title="Історична волатильність" 
        value={volatility}
        prefix="" 
        suffix="%" 
        color="#3b82f6"
        tooltip="Показник того, наскільки сильно коливалася ціна активу в минулому. Чим вище %, тим ризикованіший актив."
      />
      <KpiCard 
        title="Коефіцієнт Шарпа" 
        value={sharpeRatio}
        prefix="" 
        color={Number(sharpeRatio) >= 0 ? "#a855f7" : "#ef4444"}
        tooltip="Показує дохідність на одиницю ризику. Значення > 1 — добре, > 2 — відмінно, < 0 — актив гірший за безризиковий."
      />
      <KpiCard 
        title="Макс. просадка" 
        value={Math.abs(maxDrawdown)}
        prefix="" 
        suffix="%" 
        color="#ec4899"
        tooltip="Найбільше падіння ціни від пікового значення до мінімуму в історичних даних. Чим менше, тим стабільніший актив."
      />
    </div>
  );
};

export default KpiCards;
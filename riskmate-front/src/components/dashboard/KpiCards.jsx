import React, { useState } from 'react';
import CountUp from 'react-countup';

// Хелпер для форматування грошей (додає коми)
const fmtMoney = (val) => {
  if (val === undefined || val === null) return '0.00';
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Компонент іконки з підказкою
const InfoIcon = ({ text }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!text) return null;

  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex', cursor: 'help', marginLeft: '8px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ color: '#64748b', fontSize: '14px' }}>ⓘ</span>
      
      {isHovered && (
        <div style={{
          position: 'absolute', bottom: '150%', left: '50%', transform: 'translateX(-50%)',
          width: '220px', backgroundColor: '#1e293b', color: '#e2e8f0', padding: '10px 14px',
          borderRadius: '8px', fontSize: '12px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          border: '1px solid #334155', zIndex: 100, textTransform: 'none', letterSpacing: 'normal',
          fontWeight: 'normal', lineHeight: '1.4'
        }}>
          {text}
          <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '6px', borderStyle: 'solid', borderColor: '#334155 transparent transparent transparent' }}></div>
          <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '5px', borderStyle: 'solid', borderColor: '#1e293b transparent transparent transparent' }}></div>
        </div>
      )}
    </div>
  );
};

// Компонент однієї картки
const KpiCard = ({ title, value, prefix = "$", suffix = "", color = "#f8fafc", tooltip }) => {
  const numericValue = Number(value) || 0;

  return (
    <div style={{ 
      backgroundColor: 'rgba(30, 41, 59, 0.7)', 
      backdropFilter: 'blur(10px)',
      padding: '24px', 
      borderRadius: '16px', 
      border: '1px solid #334155', 
      flex: 1, 
      minWidth: '220px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        {title}
        <InfoIcon text={tooltip} /> 
      </h3>
      <div style={{ fontSize: '2rem', fontWeight: '800', color: color, textShadow: `0 0 20px ${color}40` }}>
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
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '25px' }}>
      <KpiCard 
        title="Очікувана ціна активу" 
        value={metrics?.expected_price} 
        color="#10b981"
        tooltip="Найбільш ймовірна ціна активу в кінці обраного періоду, розрахована як середнє значення всіх симуляцій."
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
        value={metrics?.volatility || 0} /* <--- ВИНУВАТЕЦЬ ВИДАЛЕНИЙ! */
        prefix="" 
        suffix="%" 
        color="#3b82f6"
        tooltip="Показник того, наскільки сильно коливалася ціна активу в минулому. Чим вище %, тим ризикованіший актив."
      />
    </div>
  );
};

export default KpiCards;
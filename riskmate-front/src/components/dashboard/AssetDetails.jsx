import React from 'react';

// Допоміжна функція для красивого форматування чисел (мільйони, мільярди, трильйони)
const formatNumber = (num, isCurrency = false, isPercent = false) => {
  if (num === "N/A" || num === null || num === undefined) return "—";
  
  if (isPercent) return (num * 100).toFixed(2) + "%";
  
  if (typeof num === 'number') {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + " трлн";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + " млрд";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + " млн";
    
    // Форматуємо звичайні числа з комами
    return isCurrency ? `$${num.toFixed(2)}` : num.toLocaleString('en-US');
  }
  return num;
};

const AssetDetails = ({ details }) => {
  if (!details) return null; // Якщо даних ще немає, нічого не показуємо

  // Масив з нашими метриками для зручного виведення
  const stats = [
    { label: "Відкриття", value: formatNumber(details.open, true) },
    { label: "Обсяг", value: formatNumber(details.volume) },
    { label: "52-тиж. макс.", value: formatNumber(details.week52High, true) },
    { label: "Дохідність (Див.)", value: formatNumber(details.dividend, false, true) },
    
    { label: "Максимум", value: formatNumber(details.high, true) },
    { label: "P/E (Ц/П)", value: formatNumber(details.peRatio) },
    { label: "52-тиж. мін.", value: formatNumber(details.week52Low, true) },
    { label: "Бета-фактор", value: formatNumber(details.beta) },
    
    { label: "Мінімум", value: formatNumber(details.low, true) },
    { label: "Ринкова кап.", value: formatNumber(details.marketCap) },
    { label: "Сер. обсяг", value: "—" }, // YFinance не завжди дає середній обсяг, можна залишити порожнім
    { label: "ПНА (EPS)", value: "—" } 
  ];

  return (
    <div style={{
      backgroundColor: '#1C1C1E', // Колір як у Apple
      borderRadius: '16px',
      padding: '20px 24px',
      marginTop: '20px',
      border: '1px solid #38383A'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', // Адаптивна сітка
        columnGap: '40px',
        rowGap: '16px'
      }}>
        {stats.map((stat, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #38383A', paddingBottom: '6px' }}>
            <span style={{ color: '#8E8E93', fontSize: '13px' }}>{stat.label}</span>
            <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetDetails;
import React from 'react';

const AssetDetails = ({ details }) => {
  // Перевіряємо, чи є дані і чи це дійсно масив (адже бекенд відправляє масив)
  if (!details || !Array.isArray(details) || details.length === 0) {
    return null; 
  }

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
        {/* Беремо готовий масив від бекенда і просто відмальовуємо його */}
        {details.map((stat, index) => (
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
import React from 'react';
// Імпортуємо стилі як об'єкт
import styles from '../dashboard/css/AssetDetails.module.css';

const AssetDetails = ({ details }) => {
  // Перевіряємо, чи є дані і чи це дійсно масив (адже бекенд відправляє масив)
  if (!details || !Array.isArray(details) || details.length === 0) {
    return null; 
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Беремо готовий масив від бекенда і просто відмальовуємо його */}
        {details.map((stat, index) => (
          <div key={index} className={styles.statRow}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetDetails;
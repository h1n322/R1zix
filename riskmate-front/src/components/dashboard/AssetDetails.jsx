import React from 'react';
// Імпортуємо стилі як об'єкт
import styles from '../dashboard/css/AssetDetails.module.css';

const AssetDetails = ({ details }) => {
  if (!details) return null;

  let items = [];
  if (Array.isArray(details)) {
    items = details.map(stat => ({
      label: stat.label ?? stat.Label ?? '',
      value: stat.value ?? stat.Value ?? ''
    })).filter(i => i.label || i.value);
  } else if (typeof details === 'object') {
    const symbol = details.symbol || details.ticker || '';
    const company = details.companyName || details.shortName || '';
    const sector = details.sector || '';
    const price = details.currentPrice !== undefined ? `$${details.currentPrice}` : '';

    items = [
      symbol ? { label: "Тикер", value: symbol } : null,
      company ? { label: "Компанія", value: company } : null,
      sector ? { label: "Сектор", value: sector } : null,
      price ? { label: "Ціна", value: price } : null
    ].filter(Boolean);
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {items.map((stat, index) => (
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
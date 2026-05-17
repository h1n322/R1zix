import React from 'react';
import styles from '../dashboard/css/NewsFeed.module.css';

const NewsFeed = ({ news }) => {
  // Якщо новин немає, показуємо заглушку
  if (!news || news.length === 0) {
    return (
      <div className={styles.cardContainer}>
        <h3 className={styles.title}>Останні новини</h3>
        <p className={styles.emptyText}>Новин для цього активу тимчасово немає...</p>
      </div>
    );
  }

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.title}>Останні новини</h3>
      <div className={styles.newsList}>
        {news.map((item, idx) => {
          const date = new Date(item.timestamp * 1000).toLocaleDateString('uk-UA', { 
            day: 'numeric', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          return (
            <div key={idx} className={styles.newsItem}>
              {/* Ніяких onMouseOver, все працює через CSS! */}
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.newsLink}
              >
                {item.title}
              </a>
              <div className={styles.newsMeta}>
                <span className={styles.publisher}>{item.publisher}</span> • {date}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsFeed;
import React from 'react';
import styles from '../dashboard/css/NewsFeed.module.css';

const NewsFeed = ({ news }) => {
  // Якщо новин немає, показуємо заглушку
  if (!news || !Array.isArray(news) || news.length === 0) {
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
          const rawTs = item.timestamp ?? item.Timestamp ?? 0;
          const date = rawTs ? new Date(rawTs * 1000).toLocaleDateString('uk-UA', { 
            day: 'numeric', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '';
          
          return (
            <div key={idx} className={styles.newsItem}>
              {/* Ніяких onMouseOver, все працює через CSS! */}
              <a 
                href={item.link ?? item.Link ?? '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.newsLink}
              >
                {item.title ?? item.Title}
              </a>
              <div className={styles.newsMeta}>
                <span className={styles.publisher}>{item.publisher ?? item.Publisher}</span>{date ? ` • ${date}` : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsFeed;
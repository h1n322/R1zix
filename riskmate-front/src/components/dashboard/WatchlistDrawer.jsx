import React, { useState } from 'react';
import styles from '../dashboard/css/WatchListDrawer.module.css';

const WatchlistDrawer = ({ isOpen, onClose, watchlist, onAdd, onRemove, onSelect }) => {
  const [newTicker, setNewTicker] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTicker.trim()) {
      onAdd(newTicker.trim().toUpperCase());
      setNewTicker('');
    }
  };

  return (
    <>
      {/* Затемнення фону */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      {/* Сама панель */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : styles.drawerClosed}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>МОЇ ТІКЕРИ</h2>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>

        <form onSubmit={handleAdd} className={styles.form}>
          <input 
            type="text" 
            value={newTicker} 
            onChange={(e) => setNewTicker(e.target.value)} 
            placeholder="Напр. TSLA"
            className={styles.input}
          />
          <button type="submit" className={styles.addBtn}>
            +
          </button>
        </form>

        <div className={styles.list}>
          {watchlist.length === 0 ? (
            <p className={styles.emptyState}>Список порожній. Додайте свій перший актив!</p>
          ) : (
            watchlist.map((t, index) => (
              <div key={index} className={styles.listItem}>
                <span 
                  onClick={() => { onSelect(t); onClose(); }}
                  className={styles.tickerName}
                >
                  {t}
                </span>
                <button 
                  onClick={() => onRemove(t)}
                  className={styles.removeBtn}
                >
                  Видалити
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default WatchlistDrawer;
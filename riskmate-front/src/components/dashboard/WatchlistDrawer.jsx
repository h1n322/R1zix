import React, { useState } from 'react';

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
      {/* Затемнення фону (якщо клікнути повз панель — вона закриється) */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        />
      )}

      {/* Сама панель */}
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '320px', height: '100vh',
        backgroundColor: '#1C1C1E', borderLeft: '1px solid #38383A', zIndex: 1000,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column', padding: '20px', boxShadow: '-5px 0 25px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>МОЇ ТІКЕРИ</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8E8E93', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={newTicker} 
            onChange={(e) => setNewTicker(e.target.value)} 
            placeholder="Напр. TSLA"
            style={{ flex: 1, backgroundColor: '#2C2C2E', border: '1px solid #38383A', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
          />
          <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            +
          </button>
        </form>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {watchlist.length === 0 ? (
            <p style={{ color: '#8E8E93', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>Список порожній. Додайте свій перший актив!</p>
          ) : (
            watchlist.map((t, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2C2C2E', padding: '12px 16px', borderRadius: '8px' }}>
                <span 
                  onClick={() => { onSelect(t); onClose(); }}
                  style={{ color: '#fff', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}
                >
                  {t}
                </span>
                <button 
                  onClick={() => onRemove(t)}
                  style={{ background: 'transparent', border: 'none', color: '#FF3B30', cursor: 'pointer', padding: '4px' }}
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
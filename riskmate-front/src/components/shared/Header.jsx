import React from 'react';
import { useNavigate } from 'react-router-dom';
// Імпортуємо іконки з папки io5 (Ionicons 5)
import { IoBookmarkOutline, IoListOutline } from "react-icons/io5";
const Header = ({ user, onLogout, onOpenWatchlist }) => {
  const navigate = useNavigate();

  return (
    <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
      
      {/* КНОПКА WATCHLIST */}
      <button 
        onClick={onOpenWatchlist}
        style={{ backgroundColor: 'rgba(28, 28, 30, 0.8)', border: '1px solid #38383A', color: '#fff', padding: '8px 16px', borderRadius: '16px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#2C2C2E'}
        onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(28, 28, 30, 0.8)'}
      >
       <IoBookmarkOutline size={15} />
        Мій портфель
      </button>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#1C1C1E', padding: '5px 15px 5px 5px', borderRadius: '24px', border: '1px solid #38383A' }}>
          
          {/* КЛІКАБЕЛЬНИЙ БЛОК КОРИСТУВАЧА (веде на /profile) */}
          <div 
            onClick={() => navigate('/profile')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            title="Перейти в Особистий кабінет"
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}>
              {user.displayName || 'Мій Профіль'}
            </span>
          </div>

          <div style={{ height: '20px', width: '1px', backgroundColor: '#38383A' }}></div>

          {/* Кнопка "Вийти" */}
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ef4444'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
            Вийти
          </button>
        </div>
      ) : (
        <button onClick={() => navigate('/login')} style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
          Увійти
        </button>
      )}
    </header>
  );
};

export default Header;
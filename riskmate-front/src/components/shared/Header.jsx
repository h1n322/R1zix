import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoBookmarkOutline, IoHomeOutline } from "react-icons/io5";
import styles from '../GeneralStyles/Header.module.css';

const Header = ({ user, onLogout, onOpenWatchlist }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        {/* КНОПКА ГОЛОВНА */}
        <button 
          onClick={() => navigate('/')}
          className={styles.watchlistBtn}
        >
         <IoHomeOutline size={16} />
          На головну
        </button>

        {/* КНОПКА WATCHLIST */}
        <button 
          onClick={onOpenWatchlist}
          className={styles.watchlistBtn}
        >
         <IoBookmarkOutline size={16} />
          Мій портфель
        </button>
      </div>

      {user ? (
        <div className={styles.userBlock}>
          
          {/* КЛІКАБЕЛЬНИЙ БЛОК КОРИСТУВАЧА */}
          <div 
            onClick={() => navigate('/profile')}
            className={styles.profileTrigger}
            title="Перейти в Особистий кабінет"
          >
            <div className={styles.avatar}>
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <span className={styles.userName}>
              {user.displayName || 'Мій Профіль'}
            </span>
          </div>

          <div className={styles.divider}></div>

          {/* Кнопка "Вийти" */}
          <button 
            onClick={onLogout} 
            className={styles.logoutBtn}
          >
            Вийти
          </button>
        </div>
      ) : (
        <button 
          onClick={() => navigate('/login')} 
          className={styles.loginBtn}
        >
          Увійти
        </button>
      )}
    </header>
  );
};

export default Header;
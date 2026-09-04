/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
import styles from './PagesStyles/Profile.module.css'; 
import PortfolioTable from '../components/dashboard/PortfolioTable';

const Profile = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
    toast.success('Ви вийшли з акаунту');
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  if (!user) return null;

  return (
    <div className={styles.pageContainer}>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#0B0E14', color: '#f8fafc', border: '1px solid #1F2937' }
      }}/>
      <div className={styles.contentWrapper}>
        
        {/* Навігація */}
        <div className={styles.headerNav}>
          <button onClick={() => navigate('/dashboard')} className={styles.backBtn}>
            <span>←</span> У Дашборд
          </button>
        </div>

        <h1 className={styles.pageTitle}>Мій профіль</h1>

        {/* Картка користувача */}
        <div className={styles.userCard}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : getInitials(user.email)}
            </div>
            <div>
              <h2 className={styles.userName}>{user.displayName || 'Інвестор Rizix'}</h2>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Вийти з акаунту
          </button>
        </div>

        {/* Збережені портфелі (Новий компонент) */}
        <div style={{ marginTop: '2rem' }}>
          <PortfolioTable 
            user={user} 
            onLoadPortfolio={(portfolio) => {
              navigate('/dashboard', { state: { portfolioToLoad: portfolio } });
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
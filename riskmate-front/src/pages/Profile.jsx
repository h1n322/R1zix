import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

const Profile = ({ user }) => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Якщо користувач не залогінений, відправляємо на головну
    if (!user) {
      navigate('/');
      return;
    }
    fetchPortfolios();
  }, [user, navigate]);

  const fetchPortfolios = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "portfolios"), orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPortfolios(data);
    } catch (error) {
      console.error("Помилка завантаження портфелів:", error);
      toast.error("Не вдалося завантажити історію");
    } finally {
      setLoading(false);
    }
  };

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
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <Toaster position="top-right" />
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Навігація */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, fontWeight: 'bold' }}
          >
            <span>←</span> У Дашборд
          </button>
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#f8fafc' }}>Мій профіль</h1>

        {/* Картка користувача */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: 'white' }}>
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : getInitials(user.email)}
            </div>
            <div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', color: '#e2e8f0' }}>{user.displayName || 'Інвестор RiskMate'}</h2>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.target.style.backgroundColor = '#ef4444'; e.target.style.color = '#fff'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.target.style.color = '#ef4444'; }}
          >
            Вийти з акаунту
          </button>
        </div>

        {/* Збережені портфелі */}
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#e2e8f0' }}>Історія збережених симуляцій</h2>
        
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Завантаження даних...</p>
        ) : portfolios.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {portfolios.map((port) => (
              <div key={port.id} 
                   onClick={() => {
                      toast.success('Перейдіть в Дашборд та натисніть "Завантажити"');
                      navigate('/dashboard');
                   }}
                   style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
                   onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                   onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#334155'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold' }}>
                    {port.tickers || 'N/A'}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>
                    {new Date(port.updatedAt).toLocaleDateString('uk-UA')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Очікувана ціна:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>${port.metrics?.expected_price?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '4px' }}>VaR (Ризик):</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>${port.metrics?.var_5?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '50px 20px', textAlign: 'center', border: '1px dashed #475569' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📊</div>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '20px' }}>У вас ще немає збережених симуляцій.</p>
            <button onClick={() => navigate('/dashboard')} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}>
              Зробити перший розрахунок
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
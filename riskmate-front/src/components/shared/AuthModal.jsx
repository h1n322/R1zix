import React, { useState } from 'react';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Зачекайте...');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Успішний вхід!', { id: loadingToast });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Акаунт створено!', { id: loadingToast });
      }
      onClose();
      navigate('/dashboard'); // Перекидаємо на дашборд після успіху
    } catch (error) {
      toast.error(error.message.includes('auth/invalid-credential') ? 'Невірний email або пароль' : error.message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Успішний вхід через Google!');
      onClose();
      navigate('/dashboard');
    } catch (error) {
      toast.error('Помилка входу через Google');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#1C1C1E', width: '100%', maxWidth: '400px', 
        padding: '30px', borderRadius: '16px', border: '1px solid #38383A', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', position: 'relative'
      }}>
        {/* Кнопка закриття */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', background: 'none', 
          border: 'none', color: '#8E8E93', fontSize: '24px', cursor: 'pointer'
        }}>×</button>

        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px', fontSize: '24px' }}>
          {isLogin ? 'З поверненням!' : 'Створити акаунт'}
        </h2>

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', color: '#8E8E93', fontSize: '12px', marginBottom: '5px' }}>Email</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#2C2C2E', border: '1px solid #38383A', color: '#fff', outline: 'none' }}
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#8E8E93', fontSize: '12px', marginBottom: '5px' }}>Пароль</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#2C2C2E', border: '1px solid #38383A', color: '#fff', outline: 'none' }}
              placeholder="Мінімум 6 символів" minLength="6"
            />
          </div>
          
          <button type="submit" disabled={isLoading} style={{
            width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#3b82f6', 
            color: '#fff', border: 'none', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px'
          }}>
            {isLoading ? 'Зачекайте...' : (isLogin ? 'Увійти' : 'Зареєструватися')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#38383A' }}></div>
          <span style={{ margin: '0 10px', color: '#8E8E93', fontSize: '12px' }}>АБО</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#38383A' }}></div>
        </div>

        <button onClick={handleGoogleLogin} style={{
          width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#fff', 
          color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
        }}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
          Продовжити з Google
        </button>

        <p style={{ color: '#8E8E93', textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          {isLogin ? 'Немає акаунту? ' : 'Вже є акаунт? '}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? 'Зареєструватися' : 'Увійти'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
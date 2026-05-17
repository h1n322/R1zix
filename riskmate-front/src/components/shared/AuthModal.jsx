import React, { useState } from 'react';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from '../GeneralStyles/AuthModal.module.css';

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
      navigate('/dashboard'); 
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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeBtn}>&times;</button>

        <h2 className={styles.title}>
          {isLogin ? 'З поверненням!' : 'Створити акаунт'}
        </h2>

        <form onSubmit={handleEmailAuth} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="name@example.com"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Пароль</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Мінімум 6 символів" 
              minLength="6"
            />
          </div>
          
          <button type="submit" disabled={isLoading} className={styles.submitBtn}>
            {isLoading ? 'Зачекайте...' : (isLogin ? 'Увійти' : 'Зареєструватися')}
          </button>
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <span className={styles.dividerText}>АБО</span>
          <div className={styles.dividerLine}></div>
        </div>

        <button onClick={handleGoogleLogin} className={styles.googleBtn}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
          Продовжити з Google
        </button>

        <p className={styles.footerText}>
          {isLogin ? 'Немає акаунту? ' : 'Вже є акаунт? '}
          <span onClick={() => setIsLogin(!isLogin)} className={styles.toggleLink}>
            {isLogin ? 'Зареєструватися' : 'Увійти'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
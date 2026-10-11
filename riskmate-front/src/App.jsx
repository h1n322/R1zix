import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore'; 
import { auth, db } from './firebase'; 

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Landing = lazy(() => import('./pages/Landing'));
const Methodology = lazy(() => import('./pages/Methodology'));
const Guide = lazy(() => import('./pages/Guide'));
const Profile = lazy(() => import('./pages/Profile'));
const Pricing = lazy(() => import('./pages/Pricing'));

function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        gap: '16px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '3px solid rgba(59, 130, 246, 0.2)',
          borderTopColor: '#3b82f6',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.025em' }}>
        Завантаження Rizix...
      </span>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        
        // ========================================================
        // 🚀 НОВИЙ БЛОК: СИНХРОНІЗАЦІЯ З C# ТА POSTGRESQL 🚀
        // ========================================================
        try {
          // Отримуємо свіжий зашифрований JWT токен від Firebase
          const token = await currentUser.getIdToken();
          
          // Відправляємо його на наш ASP.NET Core сервер
          // Перевір порт (5276), якщо твій C# сервер запустився на іншому — зміни тут
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          })
          .then(res => res.json())
          .then(data => console.log("🔥 Успішна синхронізація з C# PostgreSQL:", data))
          .catch(err => console.error("❌ Помилка з'єднання з C# API:", err));
          
        } catch (tokenError) {
          console.error("Не вдалося отримати токен авторизації:", tokenError);
        }
        // ========================================================

        // Твій старий код для роботи з Firestore (залишився абсолютно без змін)
        const userDocRef = doc(db, "users", currentUser.uid);
        
        unsubscribeDoc = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              ...docSnap.data()
            });
            setLoading(false);
          } else {
            try {
              await setDoc(userDocRef, {
                email: currentUser.email,
                tier: 'basic'
              });
            } catch (error) {
              console.error("Помилка створення документа користувача:", error);
              setLoading(false);
            }
          }
        });
      } else {
        setUser(null);
        if (unsubscribeDoc) unsubscribeDoc();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  const isGuest = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('guest') === 'true' ||
    localStorage.getItem('guest_mode') === 'true'
  );
  const activeUser = user || (isGuest ? { uid: 'guest', email: 'guest@riskmate.io', tier: 'pro' } : null);

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/pricing" element={<Pricing user={activeUser} />} />

          <Route path="/dashboard" element={activeUser ? <Dashboard user={activeUser} /> : <Navigate to="/" />} />
          <Route path="/profile" element={activeUser ? <Profile user={activeUser} /> : <Navigate to="/" />} />

          <Route path="*" element={<Navigate to={activeUser ? "/dashboard" : "/login"} />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
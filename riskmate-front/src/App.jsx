import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore'; 
import { auth, db } from './firebase'; 

import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Methodology from './pages/Methodology';
import Guide from './pages/Guide';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';

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
          fetch("/api/auth/sync", {
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
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: '#0f172a' }}>
        Завантаження RiskMate...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/methodology" element={<Methodology />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/pricing" element={<Pricing user={user} />} />

        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
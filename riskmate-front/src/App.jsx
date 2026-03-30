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
        // "Слухаємо" документ користувача
        const userDocRef = doc(db, "users", currentUser.uid);
        
        unsubscribeDoc = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            // Якщо запис у базі є — записуємо дані в стейт
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              ...docSnap.data()
            });
            setLoading(false);
          } else {
            // ЯКЩО ЗАПИСУ НЕМАЄ — СТВОРЮЄМО ЙОГО АВТОМАТИЧНО!
            // Це критично важливо, щоб бекенду було де змінювати tier на 'pro'
            try {
              await setDoc(userDocRef, {
                email: currentUser.email,
                tier: 'basic'
              });
              // Примітка: після setDoc Firebase автоматично знову викличе onSnapshot,
              // і цього разу код піде по гілці if (docSnap.exists())
            } catch (error) {
              console.error("Помилка створення документа користувача:", error);
              setLoading(false);
            }
          }
        });
      } else {
        // Користувач не залогінений
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
        <Route path="/pricing" element={<Pricing />} />

        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
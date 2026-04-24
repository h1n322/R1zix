import { initializeApp } from "firebase/app";
// Змінено імпорт на signInWithRedirect
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // твої конфіги залишаються як є (вони публічні, їх ховати не обов'язково)
  apiKey: "AIzaSyCnvr2cggwIBkEnrWM3w_pGi-OK-ud6rHo",
  authDomain: "riskmate-ab32d.firebaseapp.com",
  projectId: "riskmate-ab32d",
  storageBucket: "riskmate-ab32d.firebasestorage.app",
  messagingSenderId: "875732207469",
  appId: "1:875732207469:web:429238bb67bac1cb3f3c64",
  measurementId: "G-Z0HLTED4QX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Реалізовано signInWithRedirect згідно з планом
export const loginWithGoogle = () => signInWithRedirect(auth, googleProvider);
export const logout = () => signOut(auth);
export const db = getFirestore(app);
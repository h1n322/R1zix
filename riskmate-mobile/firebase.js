import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnvr2cggwIBkEnrWM3w_pGi-OK-ud6rHo",
  authDomain: "riskmate-ab32d.firebaseapp.com",
  projectId: "riskmate-ab32d",
  storageBucket: "riskmate-ab32d.firebasestorage.app",
  messagingSenderId: "875732207469",
  appId: "1:875732207469:web:429238bb67bac1cb3f3c64",
  measurementId: "G-Z0HLTED4QX"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
export const db = getFirestore(app);

// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 👈 Mudança principal: use getAuth
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Não é mais necessário importar aqui

const firebaseConfig = {
  apiKey: "AIzaSyAZ_mjBXQ1swUVnNcCYyePKhejc1zM0gko",
  authDomain: "eduardozap-7ba4a.firebaseapp.com",
  projectId: "eduardozap-7ba4a",
  storageBucket: "eduardozap-7ba4a.firebasestorage.app",
  messagingSenderId: "935765782222",
  appId: "1:935765782222:web:b9cc90fa98c78ed8da2a9f",
  measurementId: "G-YD5MQQTFEF"
};

// Inicializa o App
const app = initializeApp(firebaseConfig);

// 👇 O getAuth já utiliza o AsyncStorage internamente para persistência no React Native
export const auth = getAuth(app);

// Inicializa o banco de dados
export const database = getDatabase(app);

// Inicializa o Analytics apenas se for suportado (evita erros no Android)
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, analytics };
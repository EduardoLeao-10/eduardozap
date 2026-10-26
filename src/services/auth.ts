// src/services/auth.ts
import { auth, database } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { ref, set } from 'firebase/database'; 

// AQUI ESTAVA O ERRO: A declaração da função signUp precisa vir antes do código
export async function signUp(email: string, password: string, name: string, phone: string, avatarBase64?: string) {
  // 1. Cria o usuário no Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Salva os dados no Realtime Database
  await set(ref(database, `users/${user.uid}`), {
    name: name,
    phone: phone,
    email: email,
    avatarBase64: avatarBase64 || '',
    createdAt: Date.now()
  });

  return user;
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function onAuthChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signOut() {
  return firebaseSignOut(auth);
}
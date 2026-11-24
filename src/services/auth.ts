// src/services/auth.ts
import { auth, database } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

// Cria o usuário no Authentication e salva os dados no Realtime Database
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

// 👇 NOVA FUNÇÃO: Garante que o perfil do usuário exista no banco
// Isso é útil para usuários que foram criados manualmente no painel do Firebase
// e não possuem um perfil no Realtime Database.
export async function ensureUserProfile(uid: string, email: string) {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);

  // Se o perfil NÃO existir, cria um perfil básico
  if (!snapshot.exists()) {
    await set(userRef, {
      name: email.split('@')[0], // Usa a parte antes do @ como nome provisório
      phone: 'Sem telefone',
      email: email,
      avatarBase64: '',
      createdAt: Date.now()
    });
    console.log('Perfil criado automaticamente para o usuário:', uid);
  }
}
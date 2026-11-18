// src/services/presence.ts
import { ref, onValue, set, onDisconnect } from 'firebase/database';
import { database, auth } from './firebase';

export function setupPresence(uid: string) {
  const userStatusRef = ref(database, `/status/${uid}`);
  const connectedRef = ref(database, '.info/connected');

  const isOffline = {
    state: 'offline',
    last_changed: Date.now(),
  };
  const isOnline = {
    state: 'online',
    last_changed: Date.now(),
  };

  onValue(connectedRef, (snap) => {
    if (snap.val() === false) return;

    onDisconnect(userStatusRef)
      .set(isOffline)
      .then(() => {
        set(userStatusRef, isOnline);
      });
  });
}

// 👇 NOVO: Função para ser chamada ANTES do logout
export async function clearPresence(uid: string) {
  const userStatusRef = ref(database, `/status/${uid}`);
  
  // 1. Cancela qualquer onDisconnect pendente para este usuário
  await onDisconnect(userStatusRef).cancel();
  
  // 2. Define o status como offline explicitamente enquanto o usuário ainda está autenticado
  await set(userStatusRef, {
    state: 'offline',
    last_changed: Date.now(),
  });
}
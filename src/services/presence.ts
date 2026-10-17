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
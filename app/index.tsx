// app/index.tsx
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../src/services/firebase';
import { useAuth } from '../src/contexts/AuthContext';
import { colors, spacing, radius } from '../src/utils/theme';

type UserItem = {
  uid: string;
  name: string;
  phone: string;
  avatarBase64?: string;
};

export default function Home() {
  const router = useRouter();
  const { user } = useAuth(); 
  const myUid = user?.uid;

  const [users, setUsers] = useState<UserItem[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [unreadUsers, setUnreadUsers] = useState<Record<string, boolean>>({}); // 👈 NOVO: Guarda quem tem msg não lida

  async function deleteUserData(uid: string, name: string) {
    Alert.alert('Excluir Usuário', `Deseja apagar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          await remove(ref(database, `users/${uid}`));
          const chatKey = myUid && uid ? [myUid, uid].sort().join('_') : '';
          if (chatKey) {
            await remove(ref(database, `chats/${chatKey}`));
            await remove(ref(database, `messages/${chatKey}`));
          }
          Alert.alert('Sucesso', 'Usuário removido.');
      }}
    ]);
  }

  useEffect(() => {
    if (!myUid) return;

    const usersRef = ref(database, 'users');
    const statusRef = ref(database, 'status');

    const unsubUsers = onValue(usersRef, (snap) => {
      const data = snap.val() || {};
      const list: UserItem[] = Object.entries(data)
        .filter(([uid]) => uid !== myUid)
        .map(([uid, u]: any) => ({ 
          uid, 
          name: u.name || 'Sem nome',
          phone: u.phone || 'Sem telefone',
          avatarBase64: u.avatarBase64 
        }));
      setUsers(list);
    });

    const unsubStatus = onValue(statusRef, (snap) => {
      const statusData = snap.val() || {};
      const statusMap: Record<string, string> = {};
      Object.keys(statusData).forEach((uid) => {
        statusMap[uid] = statusData[uid]?.state;
      });
      setStatuses(statusMap);
    });

    const chatsRef = ref(database, 'chats');
    let isFirstLoad = true;

    const unsubChats = onValue(chatsRef, (snap) => {
      if (isFirstLoad) { isFirstLoad = false; return; }
      
      const data = snap.val();
      if (!data) return;

      const unreadMap: Record<string, boolean> = {}; // 👈 Mapa de quem tem msg nova

      Object.values(data).forEach((chat: any) => {
        if (chat.users && Array.isArray(chat.users) && chat.users.includes(myUid)) {
          
          // 👈 A MÁGICA ACONTECE AQUI: Se o último a enviar NÃO fui eu, marca como não lida
          if (chat.lastSenderId && chat.lastSenderId !== myUid) {
            const otherUid = chat.users.find((u: string) => u !== myUid);
            if (otherUid) {
              unreadMap[otherUid] = true; // Marca esse usuário com bolinha vermelha
            }
          }

          // Código antigo do Toast
          if (chat.updatedAt > (data.lastTime || 0)) {
            setNotification(`Nova mensagem: ${chat.lastMessage}`);
            setTimeout(() => setNotification(null), 3000);
          }
        }
      });

      setUnreadUsers(unreadMap); // Salva o mapa no estado
    });

    return () => {
      unsubUsers();
      unsubStatus();
      unsubChats();
    };
  }, [myUid]);

  return (
    <View style={styles.container}>
      {notification && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{notification}</Text>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textMuted }}>
            Nenhum usuário encontrado.
          </Text>
        }
        renderItem={({ item }) => {
          const isOnline = statuses[item.uid] === 'online';
          const hasUnread = unreadUsers[item.uid]; // 👈 Verifica se tem msg não lida

          return (
            <TouchableOpacity
              style={styles.row}
              onLongPress={() => deleteUserData(item.uid, item.name)}
              onPress={() => {
                // Ao clicar, a bolinha some temporariamente até o Firebase atualizar
                setUnreadUsers(prev => ({ ...prev, [item.uid]: false })); 
                router.push(`/chatId?chatId=${item.uid}`);
              }}
            >
              {item.avatarBase64 ? (
                <Image source={{ uri: item.avatarBase64 }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, isOnline && styles.online]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, hasUnread && { fontWeight: 'bold' }]}>{item.name}</Text>
                <Text style={[styles.last, hasUnread && { color: colors.primary, fontWeight: 'bold' }]} numberOfLines={1}>
                  {isOnline ? 'online' : item.phone}
                </Text>
              </View>

              {/* 👈 NOVO: A bolinha vermelha de mensagem não lida */}
              {hasUnread && (
                <View style={styles.unreadBadge} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  row: { flexDirection: 'row', padding: spacing.md, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#ccc', marginRight: spacing.md },
  online: { borderWidth: 3, borderColor: colors.accent },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  last: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  
  // 👈 NOVO: Estilo da bolinha vermelha
  unreadBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff3b30', // Vermelho vibrante
    position: 'absolute',
    right: spacing.md,
  },

  toast: {
    position: 'absolute',
    top: 10, left: 20, right: 20,
    backgroundColor: colors.primary,
    padding: spacing.md, borderRadius: radius.md, zIndex: 999,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3, elevation: 5,
  },
  toastText: { color: colors.white, fontWeight: 'bold', fontSize: 14 },
});
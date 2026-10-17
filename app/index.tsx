import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ref, onValue } from 'firebase/database';
import { database, auth } from '../src/services/firebase';
import { colors, spacing } from '../src/utils/theme';

type UserItem = {
  uid: string;
  name: string;
  phone: string;
  avatarBase64?: string;
};

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const myUid = auth.currentUser?.uid;

  useEffect(() => {
    // Se o myUid ainda não carregou, não faz nada
    if (!myUid) return;

    const usersRef = ref(database, 'users');
    const statusRef = ref(database, 'status');

    // 1. Busca a lista de usuários
    const unsubUsers = onValue(usersRef, (snap) => {
      const data = snap.val() || {};
      const list: UserItem[] = Object.entries(data)
        .filter(([uid]) => uid !== myUid)
        .map(([uid, u]: any) => ({ uid, ...u }));
      setUsers(list);
    });

    // 2. Busca os status separadamente
    const unsubStatus = onValue(statusRef, (snap) => {
      const statusData = snap.val() || {};
      const statusMap: Record<string, string> = {};
      
      Object.keys(statusData).forEach((uid) => {
        statusMap[uid] = statusData[uid]?.state;
      });
      
      setStatuses(statusMap);
    });

    return () => {
      unsubUsers();
      unsubStatus();
    };
  }, [myUid]); // Adicionado myUid como dependência

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textMuted }}>
            Nenhum usuário cadastrado ainda.
          </Text>
        }
        renderItem={({ item }) => {
          // Verifica se o status desse usuário específico é online
          const isOnline = statuses[item.uid] === 'online';

          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push(`/chatId?chatId=${item.uid}`)}
            >
              {item.avatarBase64 ? (
                <Image source={{ uri: item.avatarBase64 }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, isOnline && styles.online]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.last} numberOfLines={1}>
                  {isOnline ? 'online' : item.phone}
                </Text>
              </View>
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
});
// app/chatId.tsx
import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ref, push, set, onValue, update, get, remove } from 'firebase/database';
import { database, auth } from '../src/services/firebase';
import { colors, spacing, radius } from '../src/utils/theme';

type Msg = { id: string; text: string; senderId: string; timestamp: number };

export default function Chat() {
  const { chatId: otherUid } = useLocalSearchParams<{ chatId: string }>();
  const myUid = auth.currentUser?.uid!;
  const chatKey = [myUid, otherUid].sort().join('_');

  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [otherName, setOtherName] = useState('');

  useEffect(() => {
    get(ref(database, `users/${otherUid}`)).then((snap) => {
      setOtherName(snap.val()?.name || 'Usuário');
    });

    const msgsRef = ref(database, `messages/${chatKey}`);
    return onValue(msgsRef, (snap) => {
      const data = snap.val() || {};
      const list: Msg[] = Object.entries(data).map(([id, m]: any) => ({ id, ...m }));
      list.sort((a, b) => a.timestamp - b.timestamp);
      setMsgs(list);
    });
  }, [chatKey, otherUid]);

  async function send() {
    if (!text.trim()) return;
    const msgRef = push(ref(database, `messages/${chatKey}`));
    await set(msgRef, {
      text,
      senderId: myUid,
      timestamp: Date.now(),
    });
    await update(ref(database, `chats/${chatKey}`), {
      users: [myUid, otherUid],
      lastMessage: text,
      updatedAt: Date.now(),
    });
    setText('');
  }

  async function deleteMessage(msgId: string) {
    Alert.alert(
      'Apagar Mensagem',
      'Deseja apagar esta mensagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(database, `messages/${chatKey}/${msgId}`));
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível apagar a mensagem.');
            }
          }
        }
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={msgs}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => {
          const me = item.senderId === myUid;
          return (
            <TouchableOpacity
              onLongPress={() => {
                if (me) deleteMessage(item.id);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.bubble, me ? styles.me : styles.other]}>
                <Text style={styles.msgText}>{item.text}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={`Mensagem para ${otherName}`}
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={{ color: colors.white, fontWeight: 'bold' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '78%', padding: spacing.sm + 2, borderRadius: radius.md, marginBottom: spacing.sm },
  me: { alignSelf: 'flex-end', backgroundColor: colors.bubbleMe },
  other: { alignSelf: 'flex-start', backgroundColor: colors.bubbleOther },
  msgText: { color: colors.text, fontSize: 15 },
  inputBar: { flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.white, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f2f2f2', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text, marginRight: spacing.sm },
  sendBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill },
});
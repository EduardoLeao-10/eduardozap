// app/chatId.tsx
import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ref, push, set, onValue, update, get, remove } from 'firebase/database';
import { database, auth } from '../src/services/firebase';
import { colors, spacing, radius } from '../src/utils/theme';
import { Feather } from '@expo/vector-icons'; 

type Msg = { id: string; text: string; senderId: string; timestamp: number };

export default function Chat() {
  const router = useRouter();
  const { chatId: otherUid } = useLocalSearchParams<{ chatId: string }>();
  
  const myUid = auth.currentUser?.uid;
  const chatKey = myUid && otherUid ? [myUid, otherUid].sort().join('_') : '';

  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [otherName, setOtherName] = useState('');

  // 1. Marca a conversa como lida assim que você entra na tela
  useEffect(() => {
    if (chatKey && myUid) {
      update(ref(database, `chats/${chatKey}`), {
        lastSenderId: myUid, // Diz que o último a "ver" foi você
      });
    }
  }, [chatKey, myUid]);

  // 2. Função para apagar a conversa inteira
  async function clearChat() {
    Alert.alert(
      'Apagar Conversa',
      'Tem certeza que deseja apagar TODAS as mensagens desta conversa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(database, `messages/${chatKey}`));
              await remove(ref(database, `chats/${chatKey}`));
              setMsgs([]); 
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível apagar a conversa.');
            }
          }
        }
      ]
    );
  }

  // 3. Busca o nome da pessoa e escuta as mensagens em tempo real
  useEffect(() => {
    if (!myUid) {
      router.replace('/login');
      return;
    }
    if (!otherUid || !chatKey) {
      router.replace('/');
      return;
    }

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
  }, [chatKey, otherUid, myUid]);

  // 4. Função de enviar mensagem
  async function send() {
    if (!text.trim() || !myUid || !chatKey) return;

    try {
      const msgRef = push(ref(database, `messages/${chatKey}`));
      await set(msgRef, {
        text: text,
        senderId: myUid,
        timestamp: Date.now(),
      });
      
      await update(ref(database, `chats/${chatKey}`), {
        users: [myUid, otherUid],
        lastMessage: text,
        lastSenderId: myUid, // Salva que VOCÊ enviou a última mensagem
        updatedAt: Date.now(),
      });
      
      setText('');
    } catch (error: any) {
      Alert.alert('Erro de Envio', 'Não foi possível enviar a mensagem.');
    }
  }

  // 5. Função para apagar uma única mensagem
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
    <>
      <Stack.Screen options={{ 
        title: otherName || 'Conversa',
        headerRight: () => (
          <TouchableOpacity onPress={clearChat} style={{ marginRight: 15 }}>
            <Feather name="trash-2" size={22} color="#fff" />
          </TouchableOpacity>
        ),
      }} />

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
    </>
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
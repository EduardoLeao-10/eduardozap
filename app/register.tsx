import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Image, StyleSheet, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, set } from 'firebase/database';
import { useRouter } from 'expo-router';   
import { database } from '../src/services/firebase';
import { auth } from '../src/services/firebase';
import { colors, spacing, radius } from '../src/utils/theme';

export default function Register() {
  const router = useRouter(); 
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.5,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0].base64) {
      setAvatar(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  }

async function handleSave() {
  if (!name || !phone) {
    Alert.alert('Ops', 'Preencha nome e telefone.');
    return;
  }
const uid = auth.currentUser?.uid;
  if (!uid) {
    Alert.alert('Erro', 'Usuário não autenticado.');
    return;
  }
  try {
    await set(ref(database, `users/${uid}`), {
      name,
      phone,
      avatarBase64: avatar || '',
      createdAt: Date.now(),
    });
    Alert.alert('Sucesso', 'Cadastro concluído!');
    router.replace('/');
  } catch (e: any) {
    Alert.alert('Erro', e.message);
  }
}

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>+ Foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Seu nome"
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.textMuted}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholderTextColor={colors.textMuted}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  avatarWrap: { marginVertical: spacing.lg },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  avatarPlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: colors.textMuted, fontWeight: '600' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.md,
  },
  buttonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Image, StyleSheet, Alert, ImageBackground
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, set } from 'firebase/database';
import { useRouter } from 'expo-router';   
import { database } from '../src/services/firebase';
import { auth } from '../src/services/firebase';
import { colors, spacing, radius } from '../src/utils/theme';
import { Feather } from '@expo/vector-icons'; 

export default function Register() {
  const router = useRouter(); 
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null); 

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

  async function pickBackground() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0].uri) {
      setBgImage(result.assets[0].uri);
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
    <ImageBackground 
      source={bgImage ? { uri: bgImage } : undefined} 
      style={styles.container}
    >
      {/* A camada overlay agora é totalmente transparente */}
      <View style={styles.overlay}>
        
        <TouchableOpacity style={styles.bgButton} onPress={pickBackground}>
          <Feather name="image" size={20} color={colors.primary} />
          <Text style={styles.bgButtonText}>Alterar Fundo</Text>
        </TouchableOpacity>

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
          maxLength={40}
          underlineColorAndroid="transparent"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textMuted}
          maxLength={20}
          underlineColorAndroid="transparent"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  
  // 👈 MUDANÇA AQUI: Removemos o backgroundColor
  overlay: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },

  bgButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 10,
  },
  bgButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
    fontSize: 12,
  },

  avatarWrap: { marginVertical: spacing.xl },
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
    maxWidth: 400,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
    color: colors.text,
    backgroundColor: '#fff', // Mantém o input branco
    outlineStyle: 'none' as 'solid', 
  },
  
  button: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginTop: spacing.md,
  },
  buttonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});
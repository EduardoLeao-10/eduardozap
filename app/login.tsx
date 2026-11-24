// app/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
// 👇 Importamos a nova função 'ensureUserProfile'
import { signIn, signUp, ensureUserProfile } from '../src/services/auth';
import { colors, spacing, radius } from '../src/utils/theme';
import { Feather } from '@expo/vector-icons'; 
import * as ImagePicker from 'expo-image-picker'; 

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');       
  const [phone, setPhone] = useState('');     
  const [isSignUp, setIsSignUp] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

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

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert('Ops', 'Preencha e-mail e senha.');
      return;
    }
    if (isSignUp && (!name || !phone)) {
      Alert.alert('Ops', 'Preencha nome e telefone para se cadastrar.');
      return;
    }
    
    try {
      if (isSignUp) {
        await signUp(email, password, name, phone, avatar || undefined);
      } else {
        // 👇 CORREÇÃO: Guarda o resultado do login para pegar o UID
        const userCredential = await signIn(email, password);
        
        // 👇 Garante que o perfil exista no banco de dados
        if (userCredential.user) {
          await ensureUserProfile(userCredential.user.uid, email);
        }
      }
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
      <View style={styles.overlay}>
        
        <TouchableOpacity style={styles.bgButton} onPress={pickBackground}>
          <Feather name="image" size={20} color={colors.primary} />
          <Text style={styles.bgButtonText}>Alterar Fundo</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>EduardoZap</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Crie sua conta' : 'Entre com seu e-mail'}
        </Text>

        {isSignUp && (
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>+ Foto</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color={colors.textMuted} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            maxLength={60}
            underlineColorAndroid="transparent"
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={colors.textMuted} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            maxLength={30}
            underlineColorAndroid="transparent"
          />
        </View>

        {isSignUp && (
          <>
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color={colors.textMuted} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={40}
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={styles.inputContainer}>
              <Feather name="phone" size={20} color={colors.textMuted} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Telefone (ex: +5564999999999)"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={20}
                underlineColorAndroid="transparent"
              />
            </View>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{isSignUp ? 'Criar conta' : 'Entrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.switchText}>
            {isSignUp ? 'Já tem conta? Entre' : 'Não tem conta? Cadastre-se'}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.white 
  },
  overlay: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  bgButton: {
    position: 'absolute',
    top: spacing.xl,
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
  
  avatarWrap: { 
    alignSelf: 'center', 
    marginBottom: spacing.md 
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  avatarText: { color: colors.textMuted, fontWeight: '600' },

  logo: { 
    fontSize: 34, 
    fontWeight: 'bold', 
    color: colors.primary, 
    textAlign: 'center', 
    marginBottom: spacing.sm,
  },
  subtitle: { 
    fontSize: 16, 
    color: colors.white, 
    textAlign: 'center', 
    marginBottom: spacing.xl,
  },
  
  inputContainer: {
    flexDirection: 'row',     
    alignItems: 'center',     
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderWidth: 1,           
    borderColor: '#ddd', 
    borderRadius: radius.md, 
    marginBottom: spacing.md, 
    backgroundColor: '#fff', 
  },
  icon: {
    paddingHorizontal: spacing.md, 
  },
  input: { 
    flex: 1,                  
    paddingVertical: spacing.md, 
    paddingRight: spacing.md, 
    fontSize: 16, 
    color: colors.text,
    outlineStyle: 'none' as 'solid', 
  },
  button: { 
    backgroundColor: colors.accent, 
    padding: spacing.md, 
    borderRadius: radius.pill, 
    alignItems: 'center', 
    marginTop: spacing.sm,
    width: '100%',           
    maxWidth: 400,           
    alignSelf: 'center',     
  },
  buttonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  switchText: { 
    color: colors.white, 
    textAlign: 'center', 
    marginTop: spacing.lg, 
    fontSize: 14,
  },
});
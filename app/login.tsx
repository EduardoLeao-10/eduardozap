import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signIn, signUp } from '../src/services/auth';
import { colors, spacing, radius } from '../src/utils/theme';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');       
  const [phone, setPhone] = useState('');     
  const [isSignUp, setIsSignUp] = useState(false);

async function handleSubmit() {
  if (!email || !password) {
    Alert.alert('Ops', 'Preencha e-mail e senha.');
    return;
  }
  if (isSignUp && (!name || !phone)) { // NOVO
    Alert.alert('Ops', 'Preencha nome e telefone para se cadastrar.');
    return;
  }
  
  try {
    if (isSignUp) {
      await signUp(email, password, name, phone); // Passando os novos dados
    } else {
      await signIn(email, password);
    }
    router.replace('/');
  } catch (e: any) {
    Alert.alert('Erro', e.message);
  }
}

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>EduardoZap</Text>
      <Text style={styles.subtitle}>
        {isSignUp ? 'Crie sua conta' : 'Entre com seu e-mail'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={colors.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {isSignUp && (
  <>
    <TextInput
      style={styles.input}
      placeholder="Nome"
      placeholderTextColor={colors.textMuted}
      value={name}
      onChangeText={setName}
    />
    <TextInput
      style={styles.input}
      placeholder="Telefone (ex: +5564999999999)"
      placeholderTextColor={colors.textMuted}
      keyboardType="phone-pad"
      value={phone}
      onChangeText={setPhone}
    />
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center', backgroundColor: colors.white },
  logo: { fontSize: 34, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: radius.md, padding: spacing.md, fontSize: 16, marginBottom: spacing.md, color: colors.text },
  button: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: radius.pill, alignItems: 'center', marginTop: spacing.sm },
  buttonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  switchText: { color: colors.primary, textAlign: 'center', marginTop: spacing.lg, fontSize: 14 },
});
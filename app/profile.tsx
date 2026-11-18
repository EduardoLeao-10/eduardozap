import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
// 👇 CORREÇÃO AQUI: Adicionamos 'goOffline' na importação
import { ref, get, remove, goOffline } from 'firebase/database';
import { deleteUser } from 'firebase/auth'; 
import { Feather } from '@expo/vector-icons';
import { database, auth } from '../src/services/firebase';
import { signOut } from '../src/services/auth';
import { clearPresence } from '../src/services/presence'; 
import { colors, spacing } from '../src/utils/theme';

type UserProfile = {
  name: string;
  phone: string;
  avatarBase64?: string;
};

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      if (Platform.OS === 'web') {
        window.location.href = '/login';
      } else {
        router.replace('/login');
      }
      return;
    }

    const fetchProfile = async () => {
      try {
        const snap = await get(ref(database, `users/${uid}`));
        if (snap.exists()) {
          setProfile(snap.val());
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

async function handleLogout() {
  // 👇 LÓGICA EXCLUSIVA PARA A PLATAFORMA WEB
  if (Platform.OS === 'web') {
    const confirmLogout = window.confirm('Deseja realmente sair da conta?');
    
    if (confirmLogout) {
      try {
        await signOut();
        window.location.href = '/login'; // Força o recarregamento da página
      } catch (error) {
        console.error("Erro ao sair:", error);
        window.alert("Não foi possível sair da conta.");
      }
    }
  } 
  // 👇 LÓGICA PARA ANDROID E IOS
  else {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (error) {
              console.error("Erro ao sair:", error);
              Alert.alert("Erro", "Não foi possível sair.");
            }
          } 
        }
      ]
    );
  }
}

  async function handleDeleteAccount() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await remove(ref(database, `users/${uid}`));
              await deleteUser(auth.currentUser!);
              
              Alert.alert('Sucesso', 'Sua conta foi excluída.');
              
              if (Platform.OS === 'web') {
                 window.location.href = '/login';
              } else {
                router.replace('/login');
              }
            } catch (error: any) {
              console.error(error);
              Alert.alert('Erro', 'Não foi possível excluir. Faça login novamente e tente de novo.');
            }
          } 
        }
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Perfil não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile.avatarBase64 ? (
        <Image source={{ uri: profile.avatarBase64 }} style={styles.avatar} />
      ) : (
        <View style={styles.avatar} />
      )}
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.phone}>{profile.phone}</Text>

      {/* Botão de Editar Perfil */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary, marginBottom: spacing.md }]} 
        onPress={() => router.push('/register')}
      >
        <Text style={styles.buttonText}>Editar Perfil / Adicionar Foto</Text>
      </TouchableOpacity>

      {/* Botão de Sair com Ícone */}
      <TouchableOpacity 
        style={[styles.button, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]} 
        onPress={handleLogout}
      >
        <Feather name="log-out" size={20} color={colors.white} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Sair da Conta</Text>
      </TouchableOpacity>

      {/* Botão de Excluir Conta */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#000', marginTop: spacing.md }]} 
        onPress={handleDeleteAccount}
      >
        <Text style={styles.buttonText}>Excluir Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: spacing.lg, backgroundColor: colors.white },
  avatar: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#ccc', marginBottom: spacing.md },
  name: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  phone: { fontSize: 15, color: colors.textMuted, marginBottom: spacing.xl },
  button: {
    backgroundColor: colors.danger, padding: spacing.md,
    borderRadius: 999, paddingHorizontal: spacing.xl,
    width: '100%', maxWidth: 400,
  },
  buttonText: { color: colors.white, fontWeight: 'bold' },
});
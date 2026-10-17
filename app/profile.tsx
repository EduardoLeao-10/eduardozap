import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ref, get, remove } from 'firebase/database';
import { deleteUser } from 'firebase/auth'; 
import { database, auth } from '../src/services/firebase';
import { signOut } from '../src/services/auth'; // Importe a função de logout
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
      router.replace('/login');
      return;
    }

    // Busca os dados do usuário no banco
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
    await signOut(); // Usa a função do Firebase
    router.replace('/login');
  }

    // NOVO: Função para excluir a conta
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
              // 1. Apaga os dados do banco de dados
              await remove(ref(database, `users/${uid}`));
              // 2. Apaga o usuário do Authentication
              await deleteUser(auth.currentUser!);
              
              Alert.alert('Sucesso', 'Sua conta foi excluída.');
              router.replace('/login');
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

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

      <TouchableOpacity 
  style={[styles.button, { backgroundColor: colors.primary, marginBottom: spacing.md }]} 
  onPress={() => router.push('/register')}
>
  <Text style={styles.buttonText}>Editar Perfil / Adicionar Foto</Text>
</TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

      {/* NOVO: Botão de Excluir Conta */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#000', marginTop: spacing.md }]} 
        onPress={handleDeleteAccount}
      >
        <Text style={styles.buttonText}>Excluir Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

// Mantenha os mesmos estilos que você já tinha
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: spacing.lg, backgroundColor: colors.white },
  avatar: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#ccc', marginBottom: spacing.md },
  name: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  phone: { fontSize: 15, color: colors.textMuted, marginBottom: spacing.xl },
  button: {
    backgroundColor: colors.danger, padding: spacing.md,
    borderRadius: 999, paddingHorizontal: spacing.xl,
  },
  buttonText: { color: colors.white, fontWeight: 'bold' },
});
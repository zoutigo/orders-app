import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/ui/Button';
import { useAppStore } from '@/hooks/useAppStore';
import { View } from 'react-native';

export default function ProfileScreen() {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);

  return (
    <View>
      {user ? (
        <ThemedText>
          Bienvenue {user.firstname} {user.lastname} ({user.email})
        </ThemedText>
      ) : (
        <ThemedText>Aucun utilisateur connecté</ThemedText>
      )}

      <Button onPress={logout}>Déconnexion</Button>
    </View>
  );
}

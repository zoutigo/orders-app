// app/tabs/profile.tsx
import { View, StyleSheet } from 'react-native';
import TabScreen from '@/screens/TabScreen';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/ui/Button';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import { useAppStore } from '@/hooks/useAppStore';

export default function ProfileScreen() {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const logout = useAppStore((s) => s.logout);

  const user = users.find((u) => u.id === currentUserId);

  if (!user) {
    return router.replace('/(auth)/login');
  }

  return (
    <TabScreen title="Profil" scrollable>
      <View style={styles.section}>
        <ThemedText type="defaultSemiBold" style={{ marginBottom: spacing(1), color: C.text }}>
          Compte
        </ThemedText>

        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Row label="Nom" value={user.lastname} />
          <Row label="Prénom" value={user.firstname} />
          <Row label="Email" value={user.email} />
          <Row label="ID" value={user.id} />
        </View>
      </View>

      <Button
        size="md"
        variant="danger"
        onPress={logout}
        fullWidth
        style={{ marginTop: spacing(2) }}
      >
        Déconnexion
      </Button>
    </TabScreen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  return (
    <View style={styles.row}>
      <ThemedText type="defaultSemiBold" style={{ color: C.text }}>
        {label}:
      </ThemedText>
      <ThemedText style={{ color: C.muted }}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing(3),
  },
  card: {
    padding: spacing(2),
    borderRadius: radius.md,
    gap: spacing(1.5),
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing(0.5),
  },
});

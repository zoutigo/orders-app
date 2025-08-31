// app/tabs/profile/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import TabScreen from '@/screens/TabScreen';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/ui/Button';
import ButtonGroup from '@/components/ui/ButtonGroup';
import ConfirmModal from '@/components/modals/ConfirmModal';

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

  // 🔁 Redirection propre (pas de return avant hooks)
  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  // Toujours des hooks appelés -> on sécurise l’accès aux props
  const userSafe = {
    firstname: user?.firstname ?? '',
    lastname: user?.lastname ?? '',
    email: user?.email ?? '',
    id: user?.id ?? '',
  };

  const initials = useMemo(() => {
    const f = userSafe.firstname.trim();
    const l = userSafe.lastname.trim();
    return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase();
  }, [userSafe.firstname, userSafe.lastname]);

  const fullName = useMemo(
    () => `${userSafe.firstname} ${userSafe.lastname}`.trim() || 'Utilisateur',
    [userSafe.firstname, userSafe.lastname],
  );

  const copy = async (v: string) => {
    try {
      await Clipboard.setStringAsync?.(v);
    } catch {
      // si expo-clipboard non installé, on ignore simplement
    }
  };

  return (
    <TabScreen title="Profil" scrollable>
      {/* HERO */}
      <View style={[styles.hero, { backgroundColor: C.brand }]}>
        <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
          <ThemedText type="subtitle" style={{ color: C.neutral0 }}>
            {initials || <Ionicons name="person-outline" size={22} color={C.neutral0} />}
          </ThemedText>
        </View>

        <ThemedText type="subtitle" style={{ color: C.neutral0, textAlign: 'center' }}>
          {fullName}
        </ThemedText>

        <View style={styles.pills}>
          <Pill icon="mail-outline" text={userSafe.email} />
          <Pill icon="finger-print-outline" text={userSafe.id} onPress={() => copy(userSafe.id)} />
        </View>
      </View>

      <View style={{ height: spacing(2) }} />

      {/* Infos */}
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
        <Row label="Nom" value={userSafe.lastname} />
        <Row label="Prénom" value={userSafe.firstname} />
        <Row label="Email" value={userSafe.email} />
        <Row
          label="Identifiant"
          value={userSafe.id}
          action={
            <Pressable onPress={() => copy(userSafe.id)}>
              <Ionicons name="copy-outline" size={18} color={C.muted} />
            </Pressable>
          }
        />
      </View>

      {/* Actions */}
      <View style={{ marginTop: spacing(2) }}>
        <ButtonGroup fullWidth gap={1}>
          <Button
            fullWidth
            variant="outline"
            leftIcon="create-outline"
            onPress={() => router.push('/tabs/profile/edit')}
          >
            Modifier le profil
          </Button>
          <Button
            fullWidth
            variant="outline"
            leftIcon="key-outline"
            onPress={() => router.push('/tabs/profile/password')}
          >
            Changer le mot de passe
          </Button>
        </ButtonGroup>

        <Button
          size="md"
          variant="danger"
          onPress={() => setConfirmOpen(true)}
          fullWidth
          style={{ marginTop: spacing(2) }}
          leftIcon="log-out-outline"
        >
          Déconnexion
        </Button>
      </View>

      <ConfirmModal
        visible={confirmOpen}
        title="Déconnexion"
        message="Voulez-vous vraiment vous déconnecter ?"
        confirmText="Se déconnecter"
        cancelText="Annuler"
        onConfirm={() => {
          setConfirmOpen(false);
          logout();
          router.replace('/login');
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </TabScreen>
  );
}

function Row({
  label,
  value,
  action,
}: {
  label: string;
  value?: string;
  action?: React.ReactNode;
}) {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold" style={{ color: C.text }}>
          {label}
        </ThemedText>
        <ThemedText style={{ color: C.muted, marginTop: 2 }}>{value || '—'}</ThemedText>
      </View>
      {action}
    </View>
  );
}

function Pill({
  icon,
  text,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress?: () => void;
}) {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: C.ripple }}
      style={[styles.pill, { backgroundColor: C.surface, borderColor: C.border }]}
    >
      <Ionicons name={icon} size={14} color={C.muted} />
      <ThemedText type="caption" style={{ color: C.muted }} numberOfLines={1}>
        {text}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(2),
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(1),
  },
  pills: {
    marginTop: spacing(1),
    flexDirection: 'row',
    gap: spacing(1),
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  card: {
    padding: spacing(1.5),
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing(1),
  },
  row: {
    paddingVertical: spacing(1),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing(1),
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: '100%',
  },
});

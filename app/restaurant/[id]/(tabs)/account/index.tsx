import React, { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/ui/Button';
import { useAppStore } from '@/hooks/useAppStore';
import ConfirmModal from '@/components/modals/ConfirmModal';
import Toolbar from '@/components/ui/Toolbar';
import ToolbarSpacer from '@/components/ui/ToolbarSpacer';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RestaurantDisconnect() {
  const logout = useAppStore((s) => s.logout);
  const setCurrentRestaurant = useAppStore((s) => s.setCurrentRestaurant);
  const user = useAppStore((s) => s.users.find((u) => u.id === s.currentUserId));

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const handleRestaurantDisconnect = () => {
    setCurrentRestaurant(undefined);
    router.replace('/tabs');
  };

  const handleFullDisconnect = () => {
    setCurrentRestaurant(undefined);
    logout();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <Toolbar title="Mon compte" subtitle={user?.email ?? ''} centerTitle sticky />
      <ToolbarSpacer />
      <View style={{ padding: spacing(2) }}>
      {/* --------- User Card --------- */}
      <View
        style={{
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.border,
          borderRadius: radius.lg,
          padding: spacing(2),
          marginBottom: spacing(2),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: scheme === 'light' ? C.neutral100 : C.neutral50,
              marginRight: spacing(1.5),
            }}
          >
            <Ionicons name="person-outline" size={28} color={C.brand} />
          </View>

          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle">
              {user ? `${user.firstname} ${user.lastname}` : 'Utilisateur inconnu'}
            </ThemedText>
            <ThemedText style={{ color: C.muted }}>{user?.email ?? '—'}</ThemedText>
          </View>
        </View>
      </View>
      </View>

      {/* --------- Actions --------- */}
      <View style={{ gap: spacing(1), paddingHorizontal: spacing(2) }}>
        {/* Brand teal (action non destructive) */}
        <Button
          fullWidth
          size="lg"
          leftIcon="storefront-outline"
          onPress={() => setConfirmLeave(true)}
          variant="ghost"
          style={{ borderWidth: 1, borderColor: C.brand }}
        >
          Quitter ce restaurant
        </Button>

        {/* Accent orange pour action primaire neutre */}
        <Button
          fullWidth
          size="md"
          variant="outline"
          leftIcon="person-circle-outline"
          onPress={() => router.push('/tabs/profile')}
        >
          Voir mon profil
        </Button>

        {/* Destructive */}
        <Button
          fullWidth
          variant="danger"
          size="lg"
          leftIcon="log-out-outline"
          onPress={() => setConfirmLogout(true)}
        >
          Déconnexion complète
        </Button>
      </View>

      {/* Confirmation de déconnexion destructrice */}
      <ConfirmModal
        visible={confirmLogout}
        title="Confirmer la déconnexion"
        message="Vous allez vous déconnecter de l’application et de ce restaurant. Continuer ?"
        cancelText="Annuler"
        confirmText="Se déconnecter"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          handleFullDisconnect();
        }}
      />

      <ConfirmModal
        visible={confirmLeave}
        title="Quitter ce restaurant ?"
        message="Vous retournerez à la liste des restaurants, sans vous déconnecter de l’application."
        cancelText="Annuler"
        confirmText="Quitter"
        onCancel={() => setConfirmLeave(false)}
        onConfirm={() => {
          setConfirmLeave(false);
          handleRestaurantDisconnect();
        }}
      />
    </View>
  );
}

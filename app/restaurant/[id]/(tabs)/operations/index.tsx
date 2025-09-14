import React, { useCallback, useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ThemedText';
import AuthHeroCard from '@/components/auth/AuthHeroCard';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router, type Href } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';
import { Zeroconf } from '@/services/sync/Zeroconf';

type RoleKey = 'waiter' | 'preparation' | 'cashier' | 'supervisor';

function hrefForRole(role: RoleKey, id: string): Href {
  switch (role) {
    case 'waiter':
      return {
        pathname: '/restaurant/[id]/(tabs)/operations/waiter' as const,
        params: { id },
      } as Href;
    case 'preparation':
      return {
        pathname: '/restaurant/[id]/(tabs)/operations/preparation' as const,
        params: { id },
      } as Href;
    case 'cashier':
      return {
        pathname: '/restaurant/[id]/(tabs)/operations/cashier' as const,
        params: { id },
      } as Href;
    case 'supervisor':
    default:
      return {
        pathname: '/restaurant/[id]/(tabs)/operations/supervisor' as const,
        params: { id },
      } as Href;
  }
}

export default function OperationsIndex() {
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const getUserRoleForRestaurant = useAppStore((s) => s.getUserRoleForRestaurant as any);
  const socketStatus = useAppStore((s) => s.socketStatus as any);
  const connectToMaster = useAppStore((s) => s.connectToMaster);
  const setServerAddress = useAppStore((s) => s.setServerAddress);
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const allRoles: {
    key: RoleKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    desc: string;
  }[] = [
    { key: 'waiter', label: 'Serveur', icon: 'restaurant-outline', desc: 'Tables et commandes' },
    { key: 'preparation', label: 'Préparation', icon: 'pizza-outline', desc: 'Cuisine & suivi' },
    { key: 'cashier', label: 'Caisse', icon: 'cash-outline', desc: 'Encaissements' },
    { key: 'supervisor', label: 'Superviseur', icon: 'bar-chart-outline', desc: 'Vue d’ensemble' },
  ];

  const userRole =
    currentRestaurantId && currentUserId
      ? getUserRoleForRestaurant(currentUserId, currentRestaurantId)
      : undefined;

  const roles = allRoles.filter((r) => {
    if (!userRole) return true; // fallback: montre tout si pas configuré
    if (userRole === 'owner' || userRole === 'supervisor') return true;
    if (userRole === 'waiter') return r.key === 'waiter';
    if (userRole === 'cashier') return r.key === 'cashier';
    if (userRole === 'preparator') return r.key === 'preparation';
    return true;
  });

  const onOpenRole = useCallback(
    (role: RoleKey) => {
      if (!currentRestaurantId) return;
      // Option: auto-connexion si paramétré
      if (socketStatus !== 'connected') {
        connectToMaster().catch(() => {});
      }
      router.push(hrefForRole(role, currentRestaurantId));
    },
    [currentRestaurantId, socketStatus, connectToMaster],
  );

  // Auto discovery mDNS when opening this screen
  useEffect(() => {
    if (socketStatus === 'connected') return;
    Zeroconf.startBrowsing((svc) => {
      const addr = svc.addresses?.[0] || svc.host;
      if (addr && svc.port) {
        setServerAddress(addr, svc.port);
      }
    });
    return () => {
      Zeroconf.stopBrowsing();
    };
  }, [socketStatus, setServerAddress]);

  if (!currentRestaurantId) {
    // Si jamais il n'y a pas de restaurant sélectionné, on peut rediriger ou afficher un message
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button onPress={() => router.replace('/tabs')}>Sélectionner un restaurant</Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ padding: spacing(2) }}
    >
      <AuthHeroCard
        icon="construct-outline"
        title="Vos opérations"
        subtitle="Choisissez un rôle pour accéder à vos écrans dédiés."
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1.5) }}>
        {roles.map((r) => (
          <Pressable
            key={r.key}
            onPress={() => onOpenRole(r.key)}
            android_ripple={{ color: C.ripple }}
            style={{
              width: '48%',
              minHeight: 116,
              padding: spacing(1.5),
              borderRadius: radius.lg,
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.border,
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: scheme === 'light' ? C.neutral100 : C.neutral50,
                marginBottom: spacing(1),
              }}
            >
              <Ionicons name={r.icon} size={22} color={C.brand} />
            </View>

            <View>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
                {r.label}
              </ThemedText>
              <ThemedText style={{ color: C.muted, marginTop: 2 }}>{r.desc}</ThemedText>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ height: spacing(2) }} />

      <Button
        fullWidth
        variant="outline"
        leftIcon="arrow-back-circle-outline"
        onPress={() => router.replace('/tabs')}
      >
        Retour aux restaurants
      </Button>
    </ScrollView>
  );
}

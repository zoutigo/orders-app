import React, { useCallback } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ThemedText';
import AuthHeroCard from '@/components/auth/AuthHeroCard';
import { useAppStore } from '@/hooks/useAppStore';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

type SectionKey = 'products' | 'orders' | 'users' | 'tables';

export default function ParamsIndex() {
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const restaurantName =
    useAppStore((s) => s.restaurants.find((r) => r.id === s.currentRestaurantId)?.name) ??
    'Mon restaurant';

  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  const sections: {
    key: SectionKey;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    desc: string;
  }[] = [
    {
      key: 'products',
      title: 'Produits',
      icon: 'fast-food-outline',
      desc: 'Créer, éditer, catégories',
    },
    { key: 'orders', title: 'Commandes', icon: 'receipt-outline', desc: 'Historique et suivi' },
    { key: 'users', title: 'Utilisateurs', icon: 'people-outline', desc: 'Accès et profils' },
    { key: 'tables', title: 'Tables', icon: 'grid-outline', desc: 'Plan de salle' },
  ];

  const openSection = useCallback(
    (key: SectionKey) => {
      if (!currentRestaurantId) return;
      const id = currentRestaurantId;
      switch (key) {
        case 'products':
          router.push({ pathname: '/restaurant/[id]/(tabs)/params/products', params: { id } });
          break;
        case 'orders':
          router.push({ pathname: '/restaurant/[id]/(tabs)/params/orders', params: { id } });
          break;
        case 'users':
          router.push({ pathname: '/restaurant/[id]/(tabs)/params/users', params: { id } });
          break;
        case 'tables':
          router.push({ pathname: '/restaurant/[id]/(tabs)/params/tables', params: { id } });
          break;
      }
    },
    [currentRestaurantId],
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ padding: spacing(2) }}
    >
      <AuthHeroCard
        icon="settings-outline"
        title="Paramètres du restaurant"
        subtitle={restaurantName}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1.5) }}>
        {sections.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => openSection(s.key)}
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
                backgroundColor: theme === 'light' ? C.neutral100 : C.neutral50,
                marginBottom: spacing(1),
              }}
            >
              <Ionicons name={s.icon} size={22} color={C.brand} />
            </View>
            <View>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
                {s.title}
              </ThemedText>
              <ThemedText style={{ color: C.muted, marginTop: 2 }}>{s.desc}</ThemedText>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ height: spacing(2) }} />

      <Button
        fullWidth
        variant="outline"
        leftIcon="home-outline"
        onPress={() =>
          router.replace({
            pathname: '/restaurant/[id]/(tabs)/home',
            params: { id: currentRestaurantId! },
          })
        }
      >
        Retour au tableau de bord
      </Button>
    </ScrollView>
  );
}

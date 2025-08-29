import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ThemedText';
import { useAppStore } from '@/hooks/useAppStore';
import Colors from '@/constants/Colors';
import { spacing, radius, typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ParamsIndex() {
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const restaurantName =
    useAppStore((s) => s.restaurants.find((r) => r.id === s.currentRestaurantId)?.name) ??
    'Mon restaurant';

  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      {/* ---------- Hero / Header ---------- */}
      <View
        style={{
          backgroundColor: C.brand,
          paddingTop: spacing(3),
          paddingBottom: spacing(4),
          paddingHorizontal: spacing(2),
          borderBottomLeftRadius: radius.lg,
          borderBottomRightRadius: radius.lg,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing(1.25),
            }}
          >
            <Ionicons name="settings-outline" size={30} color={C.neutral0} />
          </View>

          <ThemedText type="title" style={{ color: C.neutral0, textAlign: 'center' }}>
            Configuration du restaurant
          </ThemedText>

          <Text
            style={{
              ...(typography.default as any),
              color: 'rgba(255,255,255,0.9)',
              marginTop: spacing(0.5),
              textAlign: 'center',
            }}
          >
            {restaurantName}
          </Text>
        </View>
      </View>

      {/* ---------- Contenu ---------- */}
      <View style={{ flex: 1, padding: spacing(2) }}>
        {/* petite carte d’intro */}
        <View
          style={{
            backgroundColor: C.surface,
            borderColor: C.border,
            borderWidth: 1,
            borderRadius: radius.lg,
            padding: spacing(1.5),
            marginTop: -spacing(2), // chevauchement élégant sous le header
            marginBottom: spacing(2),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="information-circle-outline" size={18} color={C.brand} />
            <Text style={{ marginLeft: spacing(1), color: C.text, opacity: 0.85 }}>
              Gérez les éléments clés du restaurant : produits, commandes, utilisateurs et tables.
            </Text>
          </View>
        </View>

        {/* section */}
        <ThemedText type="subtitle" style={{ color: C.text, marginBottom: spacing(1) }}>
          Gestion
        </ThemedText>

        <View style={{ gap: spacing(1.5) }}>
          <Button
            fullWidth
            size="lg"
            leftIcon="fast-food-outline"
            onPress={() => router.push(`/restaurant/${currentRestaurantId}/(tabs)/params/products`)}
          >
            Gérer les produits
          </Button>

          <Button
            fullWidth
            size="lg"
            variant="outline"
            leftIcon="receipt-outline"
            onPress={() => router.push(`/restaurant/${currentRestaurantId}/(tabs)/params/orders`)}
          >
            Gérer les commandes
          </Button>

          <Button
            fullWidth
            size="lg"
            variant="primary"
            leftIcon="people-outline"
            onPress={() => router.push(`/restaurant/${currentRestaurantId}/(tabs)/params/users`)}
          >
            Gérer les utilisateurs
          </Button>

          <Button
            fullWidth
            size="lg"
            variant="ghost"
            leftIcon="grid-outline"
            onPress={() => router.push(`/restaurant/${currentRestaurantId}/(tabs)/params/tables`)}
          >
            Gérer les tables
          </Button>
        </View>
      </View>

      {/* ---------- Footer discret ---------- */}
      <View
        style={{
          paddingVertical: spacing(1.25),
          alignItems: 'center',
          borderTopColor: C.border,
          borderTopWidth: 1,
        }}
      >
        <Text style={{ color: C.muted, fontSize: 12 }}>
          Palette : <Text style={{ color: C.accent }}>accent</Text> ·{' '}
          <Text style={{ color: C.brand }}>brand</Text>
        </Text>
      </View>
    </View>
  );
}

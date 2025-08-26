// app/restaurant/[id]/(tabs)/params/_layout.tsx
import { useAppStore } from '@/hooks/useAppStore';
import { Stack } from 'expo-router';

export default function ParamsLayout() {
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const baseRoute = `/restaurant/${currentRestaurantId}/(tabs)/params`;

  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      {/* Page principale paramètres */}
      <Stack.Screen name="index" options={{ title: 'Paramètres' }} />

      {/* Sous-pages avec titres explicites */}
      <Stack.Screen name="menus/index" options={{ title: 'Menus' }} />
      <Stack.Screen name="orders/index" options={{ title: 'Commandes' }} />
      <Stack.Screen name="roles/index" options={{ title: 'Rôles' }} />
      <Stack.Screen name="users/index" options={{ title: 'Utilisateurs' }} />

      {/* Tables */}
      <Stack.Screen name="tables/index" options={{ title: 'Tables' }} />
      <Stack.Screen name="tables/create" options={{ title: 'Créer une table' }} />
      <Stack.Screen name="tables/[tableId]/index" options={{ title: 'Détails de la table' }} />
      <Stack.Screen name="tables/[tableId]/edit" options={{ title: 'Modifier une table' }} />
    </Stack>
  );
}

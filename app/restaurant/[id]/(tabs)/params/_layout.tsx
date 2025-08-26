// app/restaurant/[id]/(tabs)/params/_layout.tsx
import { Stack } from 'expo-router';

export default function ParamsLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      {/* Page principale paramètres */}
      <Stack.Screen name="index" options={{ title: 'Paramètres' }} />

      {/* Sous-pages avec titres explicites */}
      <Stack.Screen name="orders/index" options={{ title: 'Commandes' }} />
      <Stack.Screen name="users/index" options={{ title: 'Utilisateurs' }} />

      {/* Tables */}
      <Stack.Screen name="tables/index" options={{ title: 'Tables' }} />
      <Stack.Screen name="tables/create" options={{ title: 'Créer une table' }} />
      <Stack.Screen name="tables/[tableId]/index" options={{ title: 'Détails de la table' }} />
      <Stack.Screen name="tables/[tableId]/edit" options={{ title: 'Modifier une table' }} />

      {/* Products */}
      <Stack.Screen name="products/index" options={{ title: 'Produits' }} />
      <Stack.Screen name="products/create" options={{ title: 'Créer un produit' }} />
      <Stack.Screen name="products/[productId]/index" options={{ title: 'Détails du produit' }} />
      <Stack.Screen name="products/[productId]/edit" options={{ title: 'Modifier un produit' }} />
    </Stack>
  );
}

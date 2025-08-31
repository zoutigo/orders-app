// app/restaurant/[id]/(tabs)/operations/_layout.tsx
import { Stack } from 'expo-router';

export default function OperationsLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'Opérations' }} />
      <Stack.Screen name="waiter" options={{ title: 'Serveur' }} />
      <Stack.Screen name="preparation" options={{ title: 'Préparation' }} />
      {/* <Stack.Screen name="preparation/products" options={{ title: 'Produits (Prépa)' }} /> */}
      <Stack.Screen name="cashier" options={{ title: 'Caisse' }} />
      <Stack.Screen name="supervisor" options={{ title: 'Superviseur' }} />
    </Stack>
  );
}

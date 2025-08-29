// app/(tabs)/home/_layout.tsx
import { Stack } from 'expo-router';

export default function HomeDrawerLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'Vue Globale' }} />
    </Stack>
  );
}

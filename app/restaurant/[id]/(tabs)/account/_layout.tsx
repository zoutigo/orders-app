// app/tabs/help/_layout.tsx
import { Stack } from 'expo-router';

export default function AccountStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

// app/tabs/help/_layout.tsx
import { Stack } from 'expo-router';

export default function HelpStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="manual" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="contact" />
    </Stack>
  );
}

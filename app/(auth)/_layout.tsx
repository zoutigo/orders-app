// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#fcefe9', // ton fond pastel
        },
        headerShadowVisible: false, // enlève l'ombre/bordure
        headerTintColor: '#e74c3c', // couleur accent
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
        },
        headerTitleAlign: 'center',
      }}
      initialRouteName="welcome"
    >
      <Stack.Screen name="welcome" options={{ title: 'Bienvenue' }} />
      <Stack.Screen name="login" options={{ title: 'Connexion' }} />
      <Stack.Screen name="register" options={{ title: 'Inscription' }} />
    </Stack>
  );
}

// app/(auth)/login.tsx
import React from 'react';
import { View } from 'react-native';
import { spacing } from '@/constants/theme';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import LoginForm from '@/components/auth/LoginForm';
import AuthHeroCard from '@/components/auth/AuthHeroCard';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  return (
    <View style={{ flex: 1 }}>
      <AuthHeroCard icon="log-in-outline" title="Connexion" subtitle="Ravi de vous revoir 👋" />
      <View style={{ marginTop: spacing(1) }}>
        <LoginForm />
      </View>
    </View>
  );
}

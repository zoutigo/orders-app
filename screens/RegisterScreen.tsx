// app/(auth)/register.tsx
import React from 'react';
import { View } from 'react-native';
import { spacing } from '@/constants/theme';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import RegisterForm from '@/components/auth/RegisterForm';
import AuthHeroCard from '@/components/auth/AuthHeroCard';

export default function RegisterScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  return (
    <View style={{ flex: 1 }}>
      <AuthHeroCard
        icon="person-add-outline"
        title="Créer un compte"
        subtitle="Rejoignez la plateforme en quelques secondes"
      />
      <View style={{ marginTop: spacing(1) }}>
        <RegisterForm />
      </View>
    </View>
  );
}

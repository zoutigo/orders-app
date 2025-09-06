// app/(auth)/login.tsx
import React from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { spacing } from '@/constants/theme';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import LoginForm from '@/components/auth/LoginForm';
import AuthHeroCard from '@/components/auth/AuthHeroCard';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: spacing(36) }}
        style={{ flex: 1, backgroundColor: C.background }}
      >
        <AuthHeroCard icon="log-in-outline" title="Connexion" subtitle="Ravi de vous revoir 👋" />
        <View style={{ marginTop: spacing(1) }}>
          <LoginForm />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

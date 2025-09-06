// app/(auth)/register.tsx
import React, { useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { spacing } from '@/constants/theme';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import RegisterForm from '@/components/auth/RegisterForm';
import AuthHeroCard from '@/components/auth/AuthHeroCard';

export default function RegisterScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const scrollRef = useRef<ScrollView>(null);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      // Ajuster si l’en‑tête est visible sur iOS
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: spacing(36) }}
        style={{ flex: 1, backgroundColor: C.background }}
      >
        <AuthHeroCard
          icon="person-add-outline"
          title="Créer un compte"
          subtitle="Rejoignez la plateforme en quelques secondes"
        />
        <View style={{ marginTop: spacing(1) }}>
          <RegisterForm />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

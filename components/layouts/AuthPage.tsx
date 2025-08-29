// components/layout/AuthPage.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import LogoPauline from '@/components/LogoPauline';
import Toolbar from '@/components/ui/Toolbar';

import Colors from '@/constants/Colors';
import { spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import ToolbarSpacer from '../ui/ToolbarSpacer';

type AuthPageProps = { children: React.ReactNode };

export default function AuthPage({ children }: AuthPageProps) {
  const route = useRoute();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const bg = C.background as ColorValue;
  const surf = C.surface as ColorValue;
  type Stops2 = readonly [ColorValue, ColorValue];
  type Stops3 = readonly [ColorValue, ColorValue, ColorValue];

  const titles: Record<string, string> = {
    register: 'Inscription',
    login: 'Connexion',
    welcome: 'Bienvenue',
    profile: 'Profil',
  };
  const title = titles[route.name] ?? route.name;
  const showTitle = route.name !== 'welcome';

  const gradient: Stops2 | Stops3 =
    scheme === 'light' ? ([bg, surf, '#FCEFE9' as ColorValue] as const) : ([bg, surf] as const);
  return (
    <LinearGradient colors={gradient} style={{ flex: 1 }}>
      {/* Toolbar sticky */}
      <Toolbar
        title={showTitle ? title : ''}
        variant="solid"
        back={showTitle}
        sticky
        right={<LogoPauline />}
        style={{ paddingHorizontal: spacing(2) }}
      />

      {/* Espace réservé sous la barre */}
      <ToolbarSpacer />

      {/* Contenu scrollable + clavier safe */}
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: C.border }]}>
        <ThemedText style={[styles.footerText, { color: C.muted }]}>© 2025 Pauline</ThemedText>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: spacing(2), paddingVertical: spacing(2) },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing(1),
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: { fontSize: 12, opacity: 0.7 },
});

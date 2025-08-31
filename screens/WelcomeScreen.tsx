// app/(auth)/welcome.tsx (ou ton chemin actuel)
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { spacing, radius, typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function WelcomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  return (
    <View style={{ gap: spacing(2) }}>
      {/* HERO compact */}
      <View style={[styles.hero, { backgroundColor: C.brand }]}>
        <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Ionicons name="restaurant-outline" size={28} color={C.neutral0} />
        </View>
        <ThemedText type="title" style={{ color: C.neutral0, textAlign: 'center' }}>
          Bienvenue
        </ThemedText>
        <ThemedText
          type="subtitle"
          style={{ color: C.neutral0, opacity: 0.95, textAlign: 'center', marginTop: spacing(0.5) }}
        >
          Gestion des commandes{'\n'}simplifiée pour votre resto
        </ThemedText>
      </View>

      {/* CARD CTA */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: C.card,
            borderColor: C.border,
          },
        ]}
      >
        <Text style={{ ...(typography.default as any), color: C.muted, textAlign: 'center' }}>
          Connectez-vous ou créez un compte pour accéder à votre espace de gestion.
        </Text>

        <View style={{ gap: spacing(1.5), marginTop: spacing(1.5) }}>
          <Button
            fullWidth
            size="lg"
            leftIcon="log-in-outline"
            onPress={() => router.push('/login')}
          >
            Connexion
          </Button>
          <Button
            fullWidth
            size="lg"
            variant="outline"
            leftIcon="person-add-outline"
            onPress={() => router.push('/register')}
          >
            Inscription
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(2),
    borderRadius: radius.lg,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(1),
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing(2),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
});

// components/auth/AuthHeroCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { spacing, radius, typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
};

export default function AuthHeroCard({ icon, title, subtitle }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  return (
    <View
      style={{
        backgroundColor: C.brand,
        paddingVertical: spacing(2.5),
        paddingHorizontal: spacing(2),
        borderRadius: radius.lg,
        alignItems: 'center',
        marginBottom: spacing(2),
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.15)',
          marginBottom: spacing(1),
        }}
      >
        <Ionicons name={icon} size={28} color={C.neutral0} />
      </View>

      <Text style={{ ...(typography.subtitle as any), color: C.neutral0 }}>{title}</Text>
      {!!subtitle && (
        <Text
          style={{
            ...(typography.default as any),
            color: 'rgba(255,255,255,0.95)',
            marginTop: spacing(0.5),
            textAlign: 'center',
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

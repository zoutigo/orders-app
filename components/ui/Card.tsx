// components/ui/Card.tsx
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { radius, spacing } from '@/constants/theme';

type Variant = 'primary' | 'danger' | 'outline' | 'ghost';

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  compact?: boolean;
  variant?: Variant;
  customColor?: string; // 👈 permet de forcer une couleur spécifique
  chevron?: boolean; // 👈 si tu veux afficher une flèche à droite
};

export default function Card({
  title,
  icon,
  onPress,
  compact,
  variant = 'primary',
  customColor,
  chevron = true,
}: Props) {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  // Palette par défaut selon variant
  let bg: string;
  let textColor: string;
  let iconColor: string;

  switch (variant) {
    case 'danger':
      bg = C.danger;
      textColor = 'white';
      iconColor = 'white';
      break;
    case 'outline':
      bg = 'transparent';
      textColor = C.text;
      iconColor = C.text;
      break;
    case 'ghost':
      bg = 'transparent';
      textColor = C.muted;
      iconColor = C.muted;
      break;
    case 'primary':
    default:
      bg = C.card;
      textColor = C.text;
      iconColor = C.text;
      break;
  }

  // Si customColor est fourni, il override le variant
  if (customColor) {
    bg = customColor;
    textColor = theme === 'dark' ? C.neutral0 : 'white'; // contraste auto
    iconColor = textColor;
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: bg }]}
      android_ripple={{ color: C.ripple }}
    >
      <Ionicons name={icon} size={compact ? 18 : 24} color={iconColor} />
      <ThemedText type="defaultSemiBold" style={{ marginLeft: spacing(1), color: textColor }}>
        {title}
      </ThemedText>
      {!compact && <View style={{ flex: 1 }} />}
      {!compact && chevron && <Ionicons name="chevron-forward" size={20} color={textColor} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(2),
    borderRadius: radius.md,
    marginVertical: spacing(1),
  },
});

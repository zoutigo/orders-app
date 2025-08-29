// components/ui/FormCard.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { radius, spacing } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  cardStyle?: ViewStyle | ViewStyle[];
};

export default function FormCard({ children, style, cardStyle }: Props) {
  const cardBg = useThemeColor({}, 'card');

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.card, { backgroundColor: cardBg }, cardStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1),
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing(2),
    // shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
});

// components/ui/FormCard.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  cardStyle?: ViewStyle | ViewStyle[];
};

export default function FormCard({ children, style, cardStyle }: Props) {
  const cardBg = useThemeColor({}, 'card');

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.card, { backgroundColor: cardBg }, cardStyle]}>
        <>{children}</>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 100,
    padding: 4,
    height: '100%',
  },
  card: {
    width: '90%',
    height: '90%',
    borderRadius: 24,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
});

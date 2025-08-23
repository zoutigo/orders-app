import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

type Variant = 'solid' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  icon: keyof typeof Ionicons.glyphMap; // 👈 accepte directement le nom d'icône
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
};

export default function IconButton({
  icon,
  onPress,
  variant = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  testID,
}: Props) {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  const { dim, iconSize } = sizeMap[size];
  const palette = getPalette(variant, C);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      android_ripple={{ color: C.ripple, foreground: true }}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          width: dim,
          height: dim,
          borderRadius: radius.lg,
          justifyContent: 'center',
          alignItems: 'center',
        },
        palette.container,
        isDisabled && {
          backgroundColor:
            variant === 'ghost' || variant === 'outline' ? 'transparent' : C.disabledBg,
          borderColor: variant === 'outline' ? C.disabledBg : 'transparent',
          opacity: 0.6,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.iconColor} />
      ) : (
        <Ionicons
          name={icon}
          size={iconSize}
          color={isDisabled ? C.disabledText : palette.iconColor}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1 },
});

const sizeMap: Record<Size, { dim: number; iconSize: number }> = {
  sm: { dim: 32, iconSize: 16 },
  md: { dim: 44, iconSize: 20 },
  lg: { dim: 52, iconSize: 24 },
};

function getPalette(variant: Variant, C: typeof Colors.light) {
  switch (variant) {
    case 'solid':
      return {
        container: { backgroundColor: C.accent, borderColor: C.accent },
        iconColor: 'white',
      };
    case 'danger':
      return {
        container: { backgroundColor: C.danger, borderColor: C.danger },
        iconColor: 'white',
      };
    case 'outline':
      return {
        container: { backgroundColor: 'transparent', borderColor: C.border },
        iconColor: C.brand,
      };
    case 'ghost':
    default:
      return {
        container: { backgroundColor: 'transparent', borderColor: 'transparent' },
        iconColor: C.brand,
      };
  }
}

import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import Colors from '@/constants/Colors';
import { radius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
};

export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth,
  disabled,
  loading,
  leftIcon,
  rightIcon,
  style,
  testID,
}: Props) {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  const { height, padH, textSize } = sizeMap[size];

  // Palette dynamique
  const palette = useMemo(() => getPalette(variant, C), [variant, C]);
  const isDisabled = !!disabled || !!loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      android_ripple={{ color: C.ripple }}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.base,
        {
          height,
          paddingHorizontal: padH,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: palette.borderColor,
        },
        palette.container,
        fullWidth && { alignSelf: 'stretch' },
        isDisabled && {
          backgroundColor:
            variant === 'ghost' || variant === 'outline' ? 'transparent' : C.disabledBg,
          borderColor: variant === 'outline' ? C.disabledBg : palette.borderColor,
          opacity: variant === 'ghost' || variant === 'outline' ? 0.5 : 1,
        },
        style as any,
      ]}
    >
      {/* Icône gauche */}
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={18}
          color={isDisabled ? C.disabledText : palette.textColor}
          style={{ marginRight: spacing(1) }}
        />
      )}

      {/* Texte ou Loader */}
      {loading ? (
        <ActivityIndicator size="small" color={palette.spinnerColor} />
      ) : (
        <ThemedText
          type="defaultSemiBold"
          style={{
            fontSize: textSize,
            color: isDisabled ? C.disabledText : palette.textColor,
          }}
        >
          {children}
        </ThemedText>
      )}

      {/* Icône droite */}
      {rightIcon && (
        <Ionicons
          name={rightIcon}
          size={18}
          color={isDisabled ? C.disabledText : palette.textColor}
          style={{ marginLeft: spacing(1) }}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(0.75),
  },
});

const sizeMap: Record<Size, { height: number; padH: number; textSize: number }> = {
  sm: { height: 36, padH: 12, textSize: 14 },
  md: { height: 44, padH: 16, textSize: 16 },
  lg: { height: 52, padH: 18, textSize: 18 },
};

function getPalette(variant: Variant, C: typeof Colors.light) {
  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: C.accent },
        borderColor: C.accent,
        textColor: 'white',
        spinnerColor: 'white',
      };
    case 'danger':
      return {
        container: { backgroundColor: C.danger },
        borderColor: C.danger,
        textColor: 'white',
        spinnerColor: 'white',
      };
    case 'outline':
      return {
        container: { backgroundColor: 'transparent' },
        borderColor: C.border,
        textColor: C.text,
        spinnerColor: C.text,
      };
    case 'ghost':
    default:
      return {
        container: { backgroundColor: 'transparent' },
        borderColor: 'transparent',
        textColor: C.brand,
        spinnerColor: C.brand,
      };
  }
}

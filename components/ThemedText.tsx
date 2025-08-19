import { Text, TextProps } from 'react-native';

import { typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: keyof typeof typography; // 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'caption' | 'link'
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        typography[type], // 👈 applique directement le style défini dans theme.ts
        style,
      ]}
      {...rest}
    />
  );
}

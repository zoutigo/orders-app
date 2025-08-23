import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import Colors from '@/constants/Colors';
import { radius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

type Direction = 'row' | 'column';
type Align = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';

type Props = {
  children: React.ReactNode;
  direction?: Direction; // défaut: "row"
  gap?: number; // spacing(n)
  wrap?: boolean;
  align?: Align;
  fullWidth?: boolean; // ✅ gère la largeur totale
  segmented?: boolean; // mode segmenté avec séparateurs
  style?: StyleProp<ViewStyle>;
};

export default function ButtonGroup({
  children,
  direction = 'row',
  gap = 1,
  wrap = false,
  align = 'start',
  fullWidth = false,
  segmented = false,
  style,
}: Props) {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];
  const gapPx = spacing(gap);

  const nodes = React.Children.toArray(children).filter(Boolean);
  const justify = useMemo(() => mapAlign(align), [align]);

  if (!segmented) {
    return (
      <View
        style={[
          {
            flexDirection: direction,
            flexWrap: wrap ? 'wrap' : 'nowrap',
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
            alignItems: 'center',
            justifyContent: justify,
            width: fullWidth ? '100%' : undefined, // ✅ important
          },
          style,
        ]}
      >
        {nodes.map((node, idx) => {
          const isLast = idx === nodes.length - 1;
          const marginStyle =
            direction === 'row'
              ? { marginRight: isLast ? 0 : gapPx }
              : { marginBottom: isLast ? 0 : gapPx };

          return (
            <View
              key={idx}
              style={[
                marginStyle,
                fullWidth && { flex: 1 }, // ✅ enfants prennent toute la largeur
              ]}
            >
              {node}
            </View>
          );
        })}
      </View>
    );
  }

  // Mode segmenté
  return (
    <View
      style={[
        styles.segmented,
        {
          backgroundColor: C.surface,
          borderColor: C.border,
          borderRadius: radius.lg,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          flexDirection: direction,
          width: fullWidth ? '100%' : undefined, // ✅
        },
        style,
      ]}
    >
      {nodes.map((node, idx) => {
        const isLast = idx === nodes.length - 1;
        const dividerStyle =
          direction === 'row'
            ? {
                borderRightWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                borderRightColor: C.border,
              }
            : {
                borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                borderBottomColor: C.border,
              };

        return (
          <View
            key={idx}
            style={[
              styles.segment,
              dividerStyle,
              { padding: gapPx / 2, flex: fullWidth ? 1 : undefined }, // ✅
            ]}
          >
            {node}
          </View>
        );
      })}
    </View>
  );
}

function mapAlign(a: Align) {
  switch (a) {
    case 'start':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'space-between':
      return 'space-between';
    case 'space-around':
      return 'space-around';
    case 'space-evenly':
      return 'space-evenly';
    default:
      return 'flex-start';
  }
}

const styles = StyleSheet.create({
  segmented: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  segment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

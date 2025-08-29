// components/ui/ToolbarSpacer.tsx
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/constants/theme';

export const TOOLBAR_ROW_HEIGHT = 56; // hauteur standard de la toolbar

type Props = {
  customHeight?: number; // facultatif : override local
};

export default function ToolbarSpacer({ customHeight }: Props) {
  const insets = useSafeAreaInsets();

  const height =
    customHeight !== undefined ? customHeight : insets.top + TOOLBAR_ROW_HEIGHT + spacing(1);

  return <View style={{ height }} />;
}

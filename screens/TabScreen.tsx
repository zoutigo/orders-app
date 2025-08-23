// components/ui/TabScreen.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  title?: string; // optionnel
  scrollable?: boolean; // optionnel
};

export default function TabScreen({ children, title, scrollable = true }: Props) {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];
  const insets = useSafeAreaInsets();

  const Wrapper = scrollable ? ScrollView : View;

  return (
    <Wrapper
      style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top }]}
      contentContainerStyle={scrollable ? styles.scrollContent : undefined}
    >
      {title && (
        <View style={styles.header}>
          <ThemedText type="title" style={{ color: C.text, textAlign: 'center' }}>
            {title}
          </ThemedText>
        </View>
      )}

      <View
        style={[
          styles.content,
          !title && { marginTop: spacing(2) }, // 👈 si pas de titre, on compense
        ]}
      >
        {children}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing(2),
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: spacing(2),
  },
  content: {
    flex: 1,
  },
});

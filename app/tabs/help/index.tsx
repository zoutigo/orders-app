// app/tabs/help/index.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import Toolbar from '@/components/ui/Toolbar';
import AuthHeroCard from '@/components/auth/AuthHeroCard';
import Button from '@/components/ui/Button';
import ButtonGroup from '@/components/ui/ButtonGroup';
import { router } from 'expo-router';
import { spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import ToolbarSpacer from '@/components/ui/ToolbarSpacer';

export default function HelpIndexScreen() {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      {/* Sticky toolbar (absolute) */}
      {/* <Toolbar title="Aide & support" variant="solid" sticky /> */}
      <Toolbar title="Aide & support" back />
      {/* <ToolbarSpacer /> */}
      <View style={{ height: 20 }} />

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing(2),
          paddingBottom: spacing(4),
        }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeroCard
          icon="help-buoy-outline"
          title="Centre d’aide"
          subtitle="Lisez le manuel, la FAQ ou contactez-nous."
        />

        <View style={{ height: spacing(2) }} />

        <ButtonGroup direction="column" fullWidth gap={1}>
          <Button
            fullWidth
            style={{ minWidth: '100%' }}
            size="lg"
            leftIcon="book-outline"
            onPress={() => router.push('/tabs/help/manual')}
          >
            Manuel utilisateur
          </Button>

          <Button
            fullWidth
            style={{ minWidth: '100%' }}
            size="lg"
            variant="outline"
            leftIcon="help-circle-outline"
            onPress={() => router.push('/tabs/help/faq')}
          >
            Questions fréquentes
          </Button>

          <Button
            fullWidth
            style={{ minWidth: '100%' }}
            size="lg"
            variant="outline"
            leftIcon="chatbox-ellipses-outline"
            onPress={() => router.push('/tabs/help/contact')}
          >
            Nous contacter
          </Button>
        </ButtonGroup>
      </ScrollView>
    </View>
  );
}

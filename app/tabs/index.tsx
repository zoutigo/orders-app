// app/(app)/(tabs)/index.tsx  (ou le fichier où vit ce screen)
import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';

import Button from '@/components/ui/Button';
import ButtonGroup from '@/components/ui/ButtonGroup';
import { ThemedText } from '@/components/ThemedText';
import { useAppStore } from '@/hooks/useAppStore';
import AuthHeroCard from '@/components/auth/AuthHeroCard';
import Toolbar from '@/components/ui/Toolbar';
import ToolbarSpacer from '@/components/ui/ToolbarSpacer';

export default function TabsActionsScreen() {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  const [openRestaurants, setOpenRestaurants] = useState(true);
  const [openHelp, setOpenHelp] = useState(false);

  // store
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const restaurants = useAppStore((s) => s.restaurants);
  const setCurrentRestaurant = useAppStore((s) => s.setCurrentRestaurant);

  const me = useMemo(() => users.find((u) => u.id === currentUserId), [users, currentUserId]);
  const title = me ? `${me.firstname} ${me.lastname}` : 'Vos opérations';

  const goResto = useCallback(
    (id: string) => {
      setCurrentRestaurant(id);
      router.push({ pathname: '/restaurant/[id]/home', params: { id } });
    },
    [setCurrentRestaurant],
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      {/* Top bar */}
      <Toolbar title={title} centerTitle variant="solid" />
      {/* Réserve l’espace de la toolbar */}
      <ToolbarSpacer customHeight={20} />

      {/* Contenu scrollable */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing(2), paddingBottom: spacing(4) }}
      >
        {/* ---- HERO ---- */}
        <AuthHeroCard
          icon="receipt-outline"
          title="Vos opérations"
          subtitle="Accédez rapidement à vos restaurants, vos commandes et à l’aide."
        />

        <View style={{ height: spacing(1) }} />

        {/* ---- SECTION RESTAURANTS ---- */}
        <Section
          title="Mes restaurants"
          icon="storefront-outline"
          open={openRestaurants}
          onToggle={() => setOpenRestaurants((v) => !v)}
        >
          <View style={{ gap: spacing(1.25) }}>
            {/* Action de création */}
            <Button
              fullWidth
              variant="outline"
              size="md"
              leftIcon="add-circle-outline"
              onPress={() => router.push('/tabs/restaurants')}
              style={{ justifyContent: 'flex-start' }}
            >
              Créer un restaurant
            </Button>

            {/* Liste */}
            {restaurants.length === 0 ? (
              <EmptyRow text="Aucun restaurant créé pour l’instant." />
            ) : (
              restaurants.map((r) => (
                <ListRow
                  key={r.id}
                  title={r.name}
                  subtitle={r.description ?? '—'}
                  icon="home-outline"
                  onPress={() => goResto(r.id)}
                  right={<Ionicons name="chevron-forward" size={18} color={C.muted} />}
                />
              ))
            )}
          </View>
        </Section>

        {/* ---- SECTION AIDE ---- */}
        <Section
          title="Aide & support"
          icon="help-circle-outline"
          open={openHelp}
          onToggle={() => setOpenHelp((v) => !v)}
        >
          <ButtonGroup direction="column" fullWidth gap={1}>
            <Button
              fullWidth
              size="md"
              variant="outline"
              leftIcon="book-outline"
              onPress={() => router.push('/tabs/help/manual')}
              style={{ justifyContent: 'flex-start' }}
            >
              Manuel utilisateur
            </Button>
            <Button
              fullWidth
              size="md"
              variant="outline"
              leftIcon="help-circle-outline"
              onPress={() => router.push('/tabs/help/faq')}
              style={{ justifyContent: 'flex-start' }}
            >
              Questions fréquentes
            </Button>
            <Button
              fullWidth
              size="md"
              variant="outline"
              leftIcon="chatbox-ellipses-outline"
              onPress={() => router.push('/tabs/help/contact')}
              style={{ justifyContent: 'flex-start' }}
            >
              Nous contacter
            </Button>
          </ButtonGroup>
        </Section>
      </ScrollView>
    </View>
  );
}

/* ===================== Petits sous-composants UI ====================== */

function Section({
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  return (
    <View style={styles.section}>
      <Pressable
        onPress={onToggle}
        android_ripple={{ color: C.ripple }}
        style={[styles.sectionHeader, { backgroundColor: C.card, borderColor: C.border }]}
      >
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name={icon} size={18} color={C.brand} />
          <ThemedText type="defaultSemiBold" style={{ color: C.text, marginLeft: spacing(1) }}>
            {title}
          </ThemedText>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
      </Pressable>

      {open && (
        <View style={[styles.sectionBody, { backgroundColor: C.surface, borderColor: C.border }]}>
          {children}
        </View>
      )}
    </View>
  );
}

function ListRow({
  title,
  subtitle,
  icon,
  right,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: C.ripple }}
      style={[styles.row, { backgroundColor: C.card, borderColor: C.border }]}
    >
      {!!icon && (
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={18} color={C.accent} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold" style={{ color: C.text }}>
          {title}
        </ThemedText>
        {!!subtitle && (
          <ThemedText type="caption" style={{ color: C.muted }}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      {right}
    </Pressable>
  );
}

function EmptyRow({ text }: { text: string }) {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  return (
    <View style={[styles.empty, { backgroundColor: C.surface, borderColor: C.border }]}>
      <ThemedText style={{ color: C.muted }}>{text}</ThemedText>
    </View>
  );
}

/* ============================== styles =============================== */

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing(2),
  },
  sectionHeader: {
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(1.25),
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionBody: {
    marginTop: spacing(1),
    padding: spacing(1.25),
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing(1),
  },
  row: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(1.25),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(0.25),
  },
  empty: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing(1.25),
    paddingHorizontal: spacing(1.25),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

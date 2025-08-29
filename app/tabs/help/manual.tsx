import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Toolbar from '@/components/ui/Toolbar';
import ToolbarSpacer from '@/components/ui/ToolbarSpacer';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { radius, spacing } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Prise en main',
    content:
      'Créez le restaurant, les catégories et les produits. Invitez vos utilisateurs si besoin.',
  },
  {
    title: 'Gestion des commandes',
    content:
      'Depuis le rôle serveur : créer une commande, commenter, valider, sauvegarder en brouillon.',
  },
  {
    title: 'Statuts',
    content: 'DRAFT → ATTENTE_PREPA → EN_PREPA → PRÊT → SERVIE (ou SERVIE_PARTIEL).',
  },
];

export default function ManualScreen() {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <Toolbar title="Manuel utilisateur" back variant="solid" sticky />
      <ToolbarSpacer customHeight={130} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing(2), paddingBottom: spacing(4) }}
      >
        {SECTIONS.map((s, idx) => {
          const opened = !!open[idx];
          return (
            <View key={idx} style={{ marginBottom: spacing(1.25) }}>
              <Pressable
                onPress={() => setOpen((o) => ({ ...o, [idx]: !opened }))}
                android_ripple={{ color: C.ripple }}
                style={[styles.header, { backgroundColor: C.card, borderColor: C.border }]}
              >
                <ThemedText type="defaultSemiBold">{s.title}</ThemedText>
                <Ionicons name={opened ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
              </Pressable>

              {opened && (
                <View style={[styles.body, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <ThemedText>{s.content}</ThemedText>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(1.25),
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: {
    marginTop: spacing(0.75),
    padding: spacing(1.25),
    borderRadius: radius.md,
    borderWidth: 1,
  },
});

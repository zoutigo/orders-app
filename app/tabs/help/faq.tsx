import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Toolbar from '@/components/ui/Toolbar';
import ToolbarSpacer from '@/components/ui/ToolbarSpacer';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { radius, spacing } from '@/constants/theme';

const FAQS = [
  { q: 'Puis-je changer librement le statut ?', a: 'Oui, depuis le bouton de statut.' },
  { q: 'Pourquoi la table reste EN_SERVICE ?', a: 'Il existe encore une commande non SERVIE.' },
  { q: 'Comment marquer une commande payée ?', a: 'Activez le switch “Payé” depuis la liste.' },
];

export default function FAQScreen() {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <Toolbar title="FAQ" back variant="solid" sticky />
      <ToolbarSpacer customHeight={130} />

      <ScrollView
        style={{ flex: 1, marginTop: 10 }}
        contentContainerStyle={{ paddingHorizontal: spacing(2), paddingBottom: spacing(4) }}
      >
        {FAQS.map((qa, idx) => {
          const opened = !!open[idx];
          return (
            <View key={idx} style={{ marginBottom: spacing(1.25) }}>
              <Pressable
                onPress={() => setOpen((o) => ({ ...o, [idx]: !opened }))}
                android_ripple={{ color: C.ripple }}
                style={[styles.header, { backgroundColor: C.card, borderColor: C.border }]}
              >
                <ThemedText type="defaultSemiBold">{qa.q}</ThemedText>
                <Ionicons name={opened ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
              </Pressable>

              {opened && (
                <View style={[styles.body, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <ThemedText>{qa.a}</ThemedText>
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

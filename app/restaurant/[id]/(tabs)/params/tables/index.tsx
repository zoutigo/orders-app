// app/restaurant/[id]/(tabs)/params/tables/index.tsx
import { View, StyleSheet, Alert, ScrollView, Pressable } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ThemedText';
import IconButton from '@/components/ui/IconButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TablesIndex() {
  const tables = useAppStore((s) => s.tables);
  const deleteTable = useAppStore((s) => s.deleteTable);
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer la table', 'Voulez-vous vraiment supprimer cette table ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteTable(id) },
    ]);
  };

  const statusColor = (status: string) => {
    if (status === 'LIBRE') return C.success; // vert
    if (status === 'OCCUPEE' || status === 'EN_SERVICE') return C.accent; // orange
    return C.danger; // par défaut rouge (indispo/hors service si un jour dispo)
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(6) }}
    >
      {/* Header Card */}
      <View testID="tables-hero" style={[styles.header, { backgroundColor: C.brand }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing(1.25) }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <Ionicons name="grid-outline" size={22} color={C.neutral0} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={{ color: C.neutral0, fontSize: 18 }}>
              Tables
            </ThemedText>
            <ThemedText style={{ color: 'rgba(255,255,255,0.95)' }}>
              {tables.length} table(s) configurée(s)
            </ThemedText>
          </View>
        </View>
        <IconButton
          testID="add-table"
          icon="add-outline"
          variant="solid"
          size="lg"
          onPress={() =>
            router.push({
              pathname: '/restaurant/[id]/(tabs)/params/tables/create',
              params: { id: currentRestaurantId! },
            })
          }
        />
      </View>

      {tables.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Ionicons name="grid-outline" size={18} color={C.muted} />
          <ThemedText style={{ color: C.muted }}>Aucune table définie</ThemedText>
        </View>
      ) : (
        <View style={{ gap: spacing(1) }}>
          {tables.map((t) => (
            <Pressable
              testID={`table-row-${t.id}`}
              key={t.id}
              android_ripple={{ color: C.ripple }}
              style={[styles.row, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() =>
                router.push({
                  pathname: '/restaurant/[id]/(tabs)/params/tables/[tableId]',
                  params: { id: currentRestaurantId!, tableId: t.id },
                })
              }
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1) }}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: C.surface, borderColor: statusColor(t.status) },
                  ]}
                >
                  <Ionicons name="grid-outline" size={18} color={statusColor(t.status)} />
                </View>
                <View style={{ gap: 4 }}>
                  <ThemedText type="defaultSemiBold" style={{ color: C.text }}>
                    {t.name}
                  </ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1) }}>
                    <View
                      style={[styles.chip, { borderColor: C.border, backgroundColor: C.surface }]}
                    >
                      <Ionicons name="people-outline" size={14} color={C.muted} />
                      <ThemedText style={{ color: C.muted, fontSize: 12 }}>
                        {t.seats} places
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <IconButton
                  testID={`table-view-${t.id}`}
                  icon="eye-outline"
                  variant="outline"
                  onPress={() =>
                    router.push({
                      pathname: '/restaurant/[id]/(tabs)/params/tables/[tableId]',
                      params: { id: currentRestaurantId!, tableId: t.id },
                    })
                  }
                />
                <IconButton
                  testID={`table-edit-${t.id}`}
                  icon="create-outline"
                  variant="outline"
                  onPress={() =>
                    router.push({
                      pathname: '/restaurant/[id]/(tabs)/params/tables/[tableId]/edit',
                      params: { id: currentRestaurantId!, tableId: t.id },
                    })
                  }
                />
                <IconButton
                  testID={`table-delete-${t.id}`}
                  icon="trash-outline"
                  variant="danger"
                  onPress={() => handleDelete(t.id)}
                />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing(1.5),
    marginBottom: spacing(2),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(1.25),
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(4),
    borderWidth: 1,
    borderRadius: radius.lg,
    gap: spacing(1),
  },
});

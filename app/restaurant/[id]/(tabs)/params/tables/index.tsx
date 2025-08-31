// app/restaurant/[id]/(tabs)/params/tables/index.tsx
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ThemedText';
import IconButton from '@/components/ui/IconButton';

export default function TablesIndex() {
  const tables = useAppStore((s) => s.tables);
  const deleteTable = useAppStore((s) => s.deleteTable);
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer la table', 'Voulez-vous vraiment supprimer cette table ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteTable(id) },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        fullWidth
        size="lg"
        onPress={() =>
          router.push({
            pathname: '/restaurant/[id]/(tabs)/params/tables/create',
            params: { id: currentRestaurantId! },
          })
        }
      >
        Ajouter une table
      </Button>

      {tables.length === 0 ? (
        <ThemedText style={{ marginTop: 20 }}>Aucune table définie</ThemedText>
      ) : (
        tables.map((t) => (
          <View key={t.id} style={styles.row}>
            <ThemedText>{t.name}</ThemedText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <IconButton
                icon="eye-off-sharp"
                onPress={() =>
                  router.push({
                    pathname: '/restaurant/[id]/(tabs)/params/tables/[tableId]',
                    params: { id: currentRestaurantId!, tableId: t.id },
                  })
                }
              />
              <IconButton
                icon="create-outline"
                onPress={() =>
                  router.push({
                    pathname: '/restaurant/[id]/(tabs)/params/tables/[tableId]/edit',
                    params: { id: currentRestaurantId!, tableId: t.id },
                  })
                }
              />
              <IconButton icon="trash-outline" onPress={() => handleDelete(t.id)} />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
});

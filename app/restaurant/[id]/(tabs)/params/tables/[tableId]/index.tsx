import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';
import Button from '@/components/ui/Button';

export default function TableDetail() {
  const { tableId } = useLocalSearchParams<{ tableId: string }>();
  const tables = useAppStore((s) => s.tables);
  const table = tables.find((t) => t.id === tableId);

  if (!table) {
    return (
      <View style={styles.center}>
        <Text>Aucune table trouvée.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{table.name}</Text>
      <Text>Status : {table.status}</Text>
      <Text>Places : {table.seats}</Text>
      <Text>Description : {table.description || '—'}</Text>
      <Text>Disponible : {table.isUsable ? 'Oui' : 'Non'}</Text>

      <View style={styles.actions}>
        <Button
          fullWidth
          size="lg"
          onPress={() =>
            router.push(`/restaurant/${table.restaurantId}/params/tables/${table.id}/edit`)
          }
        >
          Modifier
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actions: {
    marginTop: 20,
  },
});

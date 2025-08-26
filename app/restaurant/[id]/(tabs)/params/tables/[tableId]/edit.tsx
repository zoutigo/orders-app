// app/restaurant/[id]/(tabs)/params/tables/[tableId]/update.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';
import TableForm from '@/components/auth/TableForm';

export default function UpdateTable() {
  const { tableId } = useLocalSearchParams<{ tableId: string }>();
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const tables = useAppStore((s) => s.tables);

  // On cherche la table par son id
  const table = tables.find((t) => t.id === tableId);

  useEffect(() => {
    if (!currentRestaurantId) {
      router.replace('/tabs');
    }
  }, [currentRestaurantId]);

  if (!currentRestaurantId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!table) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      }}
    >
      <TableForm restaurantId={currentRestaurantId} table={table} />
    </ScrollView>
  );
}

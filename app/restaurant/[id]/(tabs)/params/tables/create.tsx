import { useEffect } from 'react';
import { ScrollView, ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';
import TableForm from '@/components/auth/TableForm';

export default function CreateTable() {
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);

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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
      <TableForm restaurantId={currentRestaurantId} />
    </ScrollView>
  );
}

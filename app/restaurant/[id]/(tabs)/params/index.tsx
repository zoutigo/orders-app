import { View } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import { useAppStore } from '@/hooks/useAppStore';

export default function ParamsIndex() {
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);

  return (
    <View style={{ flex: 1, padding: 20, gap: 16 }}>
      <Button
        fullWidth
        onPress={() => router.push(`/restaurant/${currentRestaurantId}/(tabs)/params/products`)}
      >
        Gérer les produits
      </Button>
      <Button
        fullWidth
        onPress={() => router.push(`/restaurant/${currentRestaurantId}/(tabs)/params/orders`)}
      >
        Gérer les commandes
      </Button>
      <Button
        fullWidth
        onPress={() => router.push(`/restaurant/${currentRestaurantId}/(tabs)/params/users`)}
      >
        Gérer les utilisateurs
      </Button>
      <Button
        fullWidth
        onPress={() => router.push(`/restaurant/${currentRestaurantId}/(tabs)/params/tables`)}
      >
        Gérer les tables
      </Button>
    </View>
  );
}

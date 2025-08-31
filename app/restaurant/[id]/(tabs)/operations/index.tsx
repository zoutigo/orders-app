import { View } from 'react-native';
import Button from '@/components/ui/Button';
import { router } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';

export default function OperationsIndex() {
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);

  const roles = [
    { key: 'waiter', label: '👨‍🍳 Serveur' },
    { key: 'preparation', label: '🥘 Préparation' },
    { key: 'cashier', label: '💰 Caisse' },
    { key: 'supervisor', label: '📊 Superviseur' },
  ];

  if (!currentRestaurantId) {
    // Si jamais il n'y a pas de restaurant sélectionné, on peut rediriger ou afficher un message
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button onPress={() => router.replace('/tabs')}>Sélectionner un restaurant</Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: 16, padding: 20 }}>
      {roles.map((role) => (
        <Button
          key={role.key}
          onPress={() => {
            // Use a concrete route without group segments for reliability in release builds
            if (!currentRestaurantId) return;
            router.push(`/restaurant/${currentRestaurantId}/operations/${role.key}`);
          }}
        >
          {role.label}
        </Button>
      ))}
    </View>
  );
}

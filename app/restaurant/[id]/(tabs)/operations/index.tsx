import { View } from 'react-native';
import Button from '@/components/ui/Button';
import { router } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';

type RoleKey = 'waiter' | 'preparation' | 'cashier' | 'supervisor';

function hrefForRole(role: RoleKey, id: string) {
  switch (role) {
    case 'waiter':
      return { pathname: '/restaurant/[id]/operations/waiter' as const, params: { id } };
    case 'preparation':
      return { pathname: '/restaurant/[id]/operations/preparation' as const, params: { id } };
    case 'cashier':
      return { pathname: '/restaurant/[id]/operations/cashier' as const, params: { id } };
    case 'supervisor':
    default:
      return { pathname: '/restaurant/[id]/operations/supervisor' as const, params: { id } };
  }
}

export default function OperationsIndex() {
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);

  const roles: { key: RoleKey; label: string }[] = [
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
            if (!currentRestaurantId) return;
            router.push(hrefForRole(role.key, currentRestaurantId));
          }}
        >
          {role.label}
        </Button>
      ))}
    </View>
  );
}

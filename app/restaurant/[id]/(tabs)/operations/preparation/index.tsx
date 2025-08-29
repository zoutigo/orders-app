import { View, Text } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';

export default function PrepaIndex() {
  const orders = useAppStore((s) => s.orders);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {orders.length === 0 ? (
        <Text style={{ marginTop: 20 }}>Aucune commande en attente</Text>
      ) : (
        orders.map((o) => (
          <Text key={o.id}>
            {o.id} - {o.status}
          </Text>
        ))
      )}
    </View>
  );
}

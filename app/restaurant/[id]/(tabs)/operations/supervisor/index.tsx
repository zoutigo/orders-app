import { View, Text } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';

export default function SupervisorIndex() {
  const tables = useAppStore((s) => s.tables);
  const orders = useAppStore((s) => s.orders);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>📋 Tables</Text>
      {tables.map((t) => (
        <Text key={t.id}>
          {t.name} - {t.status}
        </Text>
      ))}

      <Text style={{ fontSize: 18, marginVertical: 12 }}>🧾 Commandes</Text>
      {orders.map((o) => (
        <Text key={o.id}>
          {o.id} - {o.status}
        </Text>
      ))}
    </View>
  );
}

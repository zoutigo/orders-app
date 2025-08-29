import { View, Text } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';

export default function CashierActions() {
  const orders = useAppStore((s) => s.orders);

  return <View style={{ flex: 1, padding: 16 }}>Cashier Actions</View>;
}

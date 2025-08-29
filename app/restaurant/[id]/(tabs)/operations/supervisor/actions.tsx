import { View, Text } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';
import { ThemedText } from '@/components/ThemedText';

export default function SupervisorActions() {
  const orders = useAppStore((s) => s.orders);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {' '}
      <ThemedText>Supervisor Actions</ThemedText>
    </View>
  );
}

import { View, Text, Switch, FlatList } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';

export default function PrepaProducts() {
  const products = useAppStore((s) => s.products);
  const toggle = useAppStore((s) => s.toggleProductAvailability);

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 12,
            borderBottomWidth: 1,
            borderColor: '#ddd',
          }}
        >
          <Text>{item.name}</Text>
          <Switch value={item.isAvailable} onValueChange={() => toggle(item.id)} />
        </View>
      )}
    />
  );
}

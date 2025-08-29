// components/orders/GroupedItems.tsx
import React from 'react';
import { View, Text, FlatList } from 'react-native';

type OrderItem = { id: string; name: string; qty: number; price: number };
type Group = { name: string; items: OrderItem[] };

export default function GroupedItems({ groups }: { groups: Record<string, Group> }) {
  return (
    <FlatList
      style={{ marginTop: 12 }}
      data={Object.values(groups)}
      keyExtractor={(grp) => grp.name}
      renderItem={({ item: grp }) => (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{grp.name}</Text>
          {grp.items.map((it) => (
            <Text key={it.id} style={{ marginLeft: 10 }}>
              {it.qty} × {it.name} – {it.qty * it.price} FCFA
            </Text>
          ))}
          <Text style={{ marginLeft: 10, fontWeight: 'bold' }}>
            Sous-total: {grp.items.reduce((s, it) => s + it.qty * it.price, 0)} FCFA
          </Text>
        </View>
      )}
      removeClippedSubviews
      initialNumToRender={10}
      windowSize={10}
      maxToRenderPerBatch={10}
    />
  );
}

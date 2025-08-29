// components/orders/ProductList.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';
import type { Product, OrderItem } from '@/types';

type Props = {
  categoryId: string;
  orderId: string;
};

export default function ProductList({ categoryId, orderId }: Props) {
  const allProducts = useAppStore((s) => s.products);
  const addItemToOrder = useAppStore((s) => s.addItemToOrder);
  const updateItemQty = useAppStore((s) => s.updateItemQty);
  const order = useAppStore((s) => s.orders.find((o) => o.id === orderId));

  const [expanded, setExpanded] = useState<string | null>(null);

  // 👇 évite de remettre un filtre dans le sélecteur Zustand ; on mémoïse ici
  const products = useMemo<Product[]>(
    () => allProducts.filter((p) => p.categoryId === categoryId && p.isAvailable),
    [allProducts, categoryId],
  );

  // 👇 on sécurise la référence puis on dépend de 'orderItems' (pas de warning ESLint)
  const orderItems: OrderItem[] = (order?.items as OrderItem[]) ?? [];

  // 👇 index rapide par productId, plus de typeof order.items quand order peut être undefined
  const itemsByProductId = useMemo(() => {
    const map = new Map<string, OrderItem>();
    for (const it of orderItems) {
      map.set(it.productId, it);
    }
    return map;
  }, [orderItems]);

  const toggleExpanded = useCallback(
    (id: string) => setExpanded((cur) => (cur === id ? null : id)),
    [],
  );

  const onDec = useCallback(
    (orderItemId: string, qty: number) => {
      if (qty > 0) updateItemQty(orderId, orderItemId, qty - 1);
    },
    [orderId, updateItemQty],
  );

  const onInc = useCallback(
    (productId: string) => addItemToOrder(orderId, productId, 1),
    [orderId, addItemToOrder],
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => {
      const orderItem = itemsByProductId.get(item.id);
      const qty = orderItem?.qty ?? 0;
      const isExpanded = expanded === item.id;

      return (
        <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ddd' }}>
          <TouchableOpacity onPress={() => toggleExpanded(item.id)}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              {item.name} – {item.price} FCFA ({item.unit})
            </Text>
          </TouchableOpacity>

          {isExpanded && <Text style={{ marginTop: 6, color: '#555' }}>{item.description}</Text>}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => orderItem && onDec(orderItem.id, qty)}
              style={{ padding: 6, backgroundColor: '#eee', borderRadius: 6, marginRight: 8 }}
            >
              <Text>-</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 16, minWidth: 24, textAlign: 'center' }}>{qty}</Text>

            <TouchableOpacity
              onPress={() => onInc(item.id)}
              style={{ padding: 6, backgroundColor: '#eee', borderRadius: 6, marginLeft: 8 }}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [expanded, itemsByProductId, onDec, onInc, toggleExpanded],
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      renderItem={renderItem}
      removeClippedSubviews
      initialNumToRender={12}
      windowSize={10}
      maxToRenderPerBatch={12}
    />
  );
}

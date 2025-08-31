// app/restaurant/[id]/(tabs)/operations/waiter/index.tsx
import React, { useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';
import type { Order, TableStatus } from '@/types';

const isOrderActive = (o: Order) => o.status !== 'SERVIE'; // adapte si besoin

export default function WaiterIndex() {
  // toujours appelé
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const restaurantId = Array.isArray(params.id) ? params.id[0] : params.id;

  // store (hooks toujours appelés)
  const tablesAll = useAppStore((s) => s.tables);
  const ordersAll = useAppStore((s) => s.orders);
  const createOrder = useAppStore((s) => s.createOrder);

  // tables du resto
  const tables = useMemo(
    () => (restaurantId ? tablesAll.filter((t) => t.restaurantId === restaurantId) : []),
    [tablesAll, restaurantId],
  );

  // index: tableId -> dernière commande active (par createdAt desc)
  const activeOrderByTable = useMemo(() => {
    const map = new Map<string, Order>();
    if (!restaurantId) return map;
    for (const o of ordersAll) {
      if (o.restaurantId !== restaurantId) continue;
      if (!o.tableId || o.tableId === 'takeaway') continue;
      if (!isOrderActive(o)) continue;

      const prev = map.get(o.tableId);
      if (!prev) {
        map.set(o.tableId, o);
      } else {
        const prevAt = Date.parse(prev.createdAt);
        const curAt = Date.parse(o.createdAt);
        if (curAt > prevAt) map.set(o.tableId, o);
      }
    }
    return map;
  }, [ordersAll, restaurantId]);

  const goToOrder = useCallback(
    (orderId: string) => {
      if (!restaurantId) return;
      router.push({
        pathname: '/restaurant/[id]/(tabs)/operations/waiter/[orderId]',
        params: { id: restaurantId, orderId },
      });
    },
    [restaurantId],
  );

  const handlePressTable = useCallback(
    (tableId: string, status: TableStatus) => {
      if (!restaurantId) return;
      // si table occupée/en service ET commande active trouvée -> ouvrir cette commande
      if ((status === 'EN_SERVICE' || status === 'OCCUPEE') && activeOrderByTable.has(tableId)) {
        const ord = activeOrderByTable.get(tableId)!;
        goToOrder(ord.id);
        return;
      }
      // sinon créer une nouvelle commande liée à la table
      const newOrderId = createOrder(restaurantId, tableId);
      goToOrder(newOrderId);
    },
    [restaurantId, activeOrderByTable, createOrder, goToOrder],
  );

  const handleCreateTakeaway = useCallback(() => {
    if (!restaurantId) return;
    const newOrderId = createOrder(restaurantId); // à emporter
    goToOrder(newOrderId);
  }, [restaurantId, createOrder, goToOrder]);

  return (
    <View style={{ flex: 1 }}>
      {!restaurantId ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Text>Restaurant introuvable (paramètre id manquant)</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={tables}
            keyExtractor={(t) => t.id}
            renderItem={({ item }) => {
              const activeOrder = activeOrderByTable.get(item.id);
              return (
                <TouchableOpacity
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderColor: '#ccc',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => handlePressTable(item.id, item.status)}
                >
                  <View style={{ flexShrink: 1, paddingRight: 8 }}>
                    <Text style={{ fontSize: 16 }}>{item.name}</Text>
                    {activeOrder ? (
                      <Text style={{ color: '#555' }}>
                        Cmd en cours: {activeOrder.id} • {activeOrder.status}
                      </Text>
                    ) : null}
                  </View>
                  <Text>{item.status}</Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={{ padding: 16 }}>
                <Text>Aucune table pour ce restaurant.</Text>
              </View>
            }
          />

          <View style={{ padding: 16 }}>
            <Button title="🥡 Nouvelle commande à emporter" onPress={handleCreateTakeaway} />
          </View>
        </>
      )}
    </View>
  );
}

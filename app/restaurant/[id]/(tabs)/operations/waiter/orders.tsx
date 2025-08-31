import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';
import type { Order, OrderStatus, Table } from '@/types';
import Colors from '@/constants/Colors';
import { spacing, radius, typography } from '@/constants/theme';

const formatAmount = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return iso ?? '—';
  }
};

const ORDER_STATUSES: readonly OrderStatus[] = [
  'DRAFT',
  'ATTENTE_PREPA',
  'EN_PREPA',
  'PRET_PARTIEL',
  'PRET_A_SERVIR',
  'SERVIE_PARTIEL',
  'SERVIE',
] as const;

const PILL_WIDTH = 160;

function getColors(scheme: 'light' | 'dark') {
  const C = Colors[scheme];
  return {
    ...C,
    bgDraft: scheme === 'light' ? '#FFEDEE' : '#5A2E33',
    bgAttente: scheme === 'light' ? '#FFF3E6' : '#5A4833',
    bgEnPrepa: scheme === 'light' ? '#EAF6F7' : '#2A3E41',
    bgPretPartiel: scheme === 'light' ? '#FFF7EA' : '#4C3D2A',
    bgPretServir: scheme === 'light' ? '#EAF7F1' : '#2F4B3D',
    bgServiePartiel: scheme === 'light' ? '#EAF7F1' : '#2F4B3D',
    bgServie: scheme === 'light' ? '#EAF7F1' : '#2F4B3D',
  };
}

function getStatusColors(status: OrderStatus, C: ReturnType<typeof getColors>) {
  switch (status) {
    case 'DRAFT':
      return { bg: C.bgDraft, border: C.danger, text: C.danger };
    case 'ATTENTE_PREPA':
      return { bg: C.bgAttente, border: C.accent, text: C.accent };
    case 'EN_PREPA':
      return { bg: C.bgEnPrepa, border: C.brand, text: C.brand };
    case 'PRET_PARTIEL':
      return { bg: C.bgPretPartiel, border: C.accent, text: C.accent };
    case 'PRET_A_SERVIR':
      return { bg: C.bgPretServir, border: C.success, text: C.success };
    case 'SERVIE_PARTIEL':
      return { bg: C.bgServiePartiel, border: C.success, text: C.success };
    case 'SERVIE':
      return { bg: C.bgServie, border: C.success, text: C.success };
    default:
      return { bg: C.neutral100, border: C.border, text: C.text };
  }
}

export default function WaiterOrders() {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const C = getColors(scheme);

  const restaurantId = useAppStore((s) => s.currentRestaurantId);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const ordersAll = useAppStore((s) => s.orders);
  const tablesAll = useAppStore((s) => s.tables);
  const getTotal = useAppStore((s) => s.getOrderTotal);
  const setStatus = useAppStore((s) => s.setOrderStatus);
  const setOrderPaid = useAppStore((s) => s.setOrderPaid);

  const [statusModalOrder, setStatusModalOrder] = useState<Order | null>(null);

  const tableNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of tablesAll as Table[]) m.set(t.id, t.name);
    return m;
  }, [tablesAll]);

  // ✅ tri de la plus ancienne → la plus récente
  const orders = useMemo(() => {
    if (!restaurantId) return [] as Order[];
    return ordersAll
      .filter((o) => o.restaurantId === restaurantId && o.waiterId === currentUserId)
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  }, [ordersAll, restaurantId, currentUserId]);

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

  const openStatusModal = useCallback((o: Order) => setStatusModalOrder(o), []);
  const closeStatusModal = useCallback(() => setStatusModalOrder(null), []);

  const chooseStatus = useCallback(
    (newStatus: OrderStatus) => {
      if (!statusModalOrder) return;
      setStatus(statusModalOrder.id, newStatus);
      setStatusModalOrder(null);
    },
    [statusModalOrder, setStatus],
  );

  const togglePaid = useCallback(
    (o: Order, next: boolean) => setOrderPaid(o.id, next),
    [setOrderPaid],
  );

  const renderItem = useCallback(
    ({ item }: { item: Order }) => {
      const isTakeaway = !item.tableId || item.tableId === 'takeaway';
      const total = getTotal(item.id);
      const tableName = !isTakeaway
        ? (tableNameById.get(item.tableId!) ?? `Table ${item.tableId}`)
        : '🥡 À emporter';

      const sc = getStatusColors(item.status as OrderStatus, C);

      return (
        <TouchableOpacity
          onPress={() => goToOrder(item.id)}
          activeOpacity={0.85}
          style={{
            padding: spacing(1.75),
            borderBottomWidth: 1,
            borderColor: C.border,
            backgroundColor: isTakeaway ? (scheme === 'light' ? '#FFF6E5' : C.surface) : C.card,
          }}
        >
          {/* Ligne 1 : id + dates */}
          <View style={{ marginBottom: spacing(0.75) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[{ color: C.text }, typography.defaultSemiBold]}>#{item.id}</Text>
              <Text style={{ color: C.muted }}>{formatDate(item.createdAt)}</Text>
            </View>
            {item.expectedAt ? (
              <View style={{ marginTop: 2, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: C.muted }}>Prévu pour</Text>
                <Text style={{ color: C.muted }}>{formatDate(item.expectedAt)}</Text>
              </View>
            ) : null}
          </View>

          {/* Ligne 2 : colonne gauche (nom table centré + pilule) / colonne droite (prix + switch payé) */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: spacing(1), alignItems: 'center' }}>
              {/* ✅ nom de table centré au-dessus de la pilule */}
              <Text style={{ fontSize: 16, color: C.text, textAlign: 'center' }}>{tableName}</Text>

              <View style={{ marginTop: spacing(0.75) }}>
                <TouchableOpacity
                  onPress={() => openStatusModal(item)}
                  activeOpacity={0.9}
                  style={{
                    width: PILL_WIDTH,
                    alignSelf: 'center',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: sc.border,
                    backgroundColor: sc.bg,
                  }}
                >
                  <Text style={{ color: sc.text, fontWeight: '700' }}>{String(item.status)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Prix + switch payé (switch en dessous du prix) */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: item.isPaid ? C.success : C.danger,
                }}
              >
                {formatAmount(total)}
              </Text>
              <View style={{ marginTop: spacing(0.5), alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: C.muted, marginBottom: spacing(0.25) }}>
                  Payé
                </Text>
                <Switch
                  value={!!item.isPaid}
                  onValueChange={(v) => togglePaid(item, v)}
                  trackColor={{ true: C.success, false: C.neutral300 }}
                  thumbColor={scheme === 'light' ? '#fff' : C.neutral700}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [C, scheme, getTotal, goToOrder, openStatusModal, togglePaid, tableNameById],
  );

  if (!restaurantId) {
    return (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(2) }}
      >
        <Text style={{ color: C.text }}>Aucun restaurant sélectionné</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        renderItem={renderItem}
        // ✅ scroll vertical + padding bas
        contentContainerStyle={{ paddingBottom: spacing(2) }}
        ListEmptyComponent={
          <View style={{ padding: spacing(2) }}>
            <Text style={{ color: C.muted }}>Aucune commande pour ce serveur.</Text>
          </View>
        }
      />

      {/* Modale de choix du statut */}
      <Modal
        visible={!!statusModalOrder}
        transparent
        animationType="fade"
        onRequestClose={closeStatusModal}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: scheme === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.12)',
          }}
          onPress={closeStatusModal}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: C.card,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            padding: spacing(2),
            borderTopWidth: 1,
            borderTopColor: C.border,
          }}
        >
          <Text style={[{ color: C.text }, typography.defaultSemiBold, { fontSize: 18 }]}>
            Changer le statut
          </Text>
          <Text style={{ marginTop: 4, color: C.muted }}>Cmd #{statusModalOrder?.id}</Text>

          <ScrollView style={{ marginTop: spacing(1), maxHeight: 340 }}>
            {ORDER_STATUSES.map((s) => {
              const sc = getStatusColors(s, C);
              const selected = statusModalOrder?.status === s;
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => chooseStatus(s)}
                  activeOpacity={0.9}
                  style={{
                    width: PILL_WIDTH,
                    alignSelf: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: selected ? sc.border : C.border,
                    backgroundColor: selected ? sc.bg : C.neutral0,
                    marginBottom: spacing(1),
                  }}
                >
                  <Text
                    style={{
                      fontWeight: '700',
                      color: selected ? sc.text : C.text,
                    }}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            onPress={closeStatusModal}
            style={{
              marginTop: spacing(1),
              paddingVertical: 12,
              backgroundColor: C.disabledBg,
              borderRadius: radius.md,
            }}
          >
            <Text style={{ textAlign: 'center', fontWeight: '700', color: C.text }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

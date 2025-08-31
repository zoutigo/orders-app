// components/restaurant/RestaurantDashboardScreen.tsx
import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAppStore } from '@/hooks/useAppStore';
import Colors from '@/constants/Colors';
import { spacing, radius, typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { Order, Product } from '@/types';

/* ---------- utils dates ---------- */
const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfWeek = (d = new Date()) => {
  const day = d.getDay() || 7; // Lundi=1…Dimanche=7
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  return startOfDay(monday);
};
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' FCFA';

/* ---------- mini Card ---------- */
function Card({
  title,
  icon,
  children,
  bg,
  border,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  bg: string;
  border: string;
}) {
  return (
    <View
      style={{
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: spacing(2),
        marginBottom: spacing(2),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1.5) }}>
        <Ionicons name={icon} size={20} color={border} style={{ marginRight: spacing(1) }} />
        <Text
          style={[
            typography.defaultSemiBold,
            { fontSize: 16, color: border, includeFontPadding: false },
          ]}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

/* ---------- Quick action card ---------- */
function QuickCard({
  title,
  icon,
  color,
  onPress,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string; // primary color for icon/border
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
      style={{
        width: '48%',
        minHeight: 92,
        padding: spacing(1.5),
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.04)',
          marginBottom: spacing(1),
        }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[typography.defaultSemiBold, { fontSize: 15, color }]}>{title}</Text>
    </Pressable>
  );
}

/* ---------- sous-composants ---------- */
function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <View
      style={{
        paddingVertical: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ color, opacity: 0.8 }}>{label}</Text>
      <Text style={[typography.defaultSemiBold, { color }]}>{String(value)}</Text>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return (
    <View style={{ height: 1, backgroundColor: color, opacity: 0.3, marginVertical: spacing(1) }} />
  );
}

/* ---------- composant principal ---------- */
export default function RestaurantDashboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const restaurantId = useAppStore((s) => s.currentRestaurantId);
  const restaurants = useAppStore((s) => s.restaurants);
  const ordersAll = useAppStore((s) => s.orders);
  const productsAll = useAppStore((s) => s.products);
  const tablesAll = useAppStore((s) => s.tables);
  const users = useAppStore((s) => s.users);

  const restaurantName = restaurants.find((r) => r.id === restaurantId)?.name ?? 'Mon Restaurant';

  // ✅ "now" est stable (pas recréé à chaque rendu)
  const now = React.useMemo(() => new Date(), []);
  const w0 = React.useMemo(() => startOfWeek(now), [now]);
  const m0 = React.useMemo(() => startOfMonth(now), [now]);

  // Filtrage des données par restaurant
  const { orders, products, tables } = useMemo(() => {
    if (!restaurantId) return { orders: [] as Order[], products: [] as Product[], tables: [] };
    return {
      orders: ordersAll.filter((o) => o.restaurantId === restaurantId),
      products: productsAll.filter((p) => p.restaurantId === restaurantId),
      tables: tablesAll.filter((t) => t.restaurantId === restaurantId),
    };
  }, [restaurantId, ordersAll, productsAll, tablesAll]);

  /* ----- Stats commandes ----- */
  const ordersStats = useMemo(() => {
    const closed = orders.filter((o) => o.status === 'SERVIE');
    return {
      closedDay: closed.filter((o) => isSameDay(new Date(o.createdAt), now)).length,
      closedWeek: closed.filter((o) => new Date(o.createdAt) >= w0).length,
      closedMonth: closed.filter((o) => new Date(o.createdAt) >= m0).length,
      draft: orders.filter((o) => o.status === 'DRAFT').length,
      prep: orders.filter((o) =>
        ['ATTENTE_PREPA', 'EN_PREPA', 'PRET_PARTIEL', 'PRET_A_SERVIR', 'SERVIE_PARTIEL'].includes(
          String(o.status),
        ),
      ).length,
      unpaid: orders.filter((o) => !o.isPaid).length,
    };
    // ✅ dépend seulement des données & bornes (now est stable)
  }, [orders, w0, m0, now]);

  /* ----- Stats produits ----- */
  const productStats = useMemo(() => {
    const qtyByProd = new Map<string, number>();
    for (const o of orders) {
      if (!o.isPaid) continue;
      for (const it of o.items) {
        qtyByProd.set(it.productId, (qtyByProd.get(it.productId) ?? 0) + it.qty);
      }
    }

    let most: { id: string; qty: number } | null = null;
    let least: { id: string; qty: number } | null = null;

    for (const p of products) {
      const q = qtyByProd.get(p.id) ?? 0;
      if (!most || q > most.qty) most = { id: p.id, qty: q };
      if (!least || q < least.qty) least = { id: p.id, qty: q };
    }

    const nameOf = (id?: string | null) => products.find((p) => p.id === id)?.name ?? '—';

    return {
      total: products.length,
      most: most && most.qty > 0 ? `${nameOf(most.id)} (${most.qty})` : '—',
      least: least ? `${nameOf(least.id)} (${least.qty})` : '—',
    };
  }, [orders, products]);

  /* ----- Chiffre d’affaire ----- */
  const revenue = useMemo(() => {
    const totalOf = (o: Order) => o.items.reduce((s, it) => s + it.qty * it.price, 0);
    const paid = orders.filter((o) => o.isPaid);

    const caJour = paid
      .filter((o) => isSameDay(new Date(o.createdAt), now))
      .reduce((s, o) => s + totalOf(o), 0);

    const caSemaine = paid
      .filter((o) => new Date(o.createdAt) >= w0)
      .reduce((s, o) => s + totalOf(o), 0);

    const caMois = paid
      .filter((o) => new Date(o.createdAt) >= m0)
      .reduce((s, o) => s + totalOf(o), 0);

    // Record journalier
    const byDay = new Map<string, number>();
    for (const o of paid) {
      const key = startOfDay(new Date(o.createdAt)).toISOString();
      byDay.set(key, (byDay.get(key) ?? 0) + totalOf(o));
    }
    let recordJour = 0;
    byDay.forEach((v) => (recordJour = Math.max(recordJour, v)));

    return { caJour, recordJour, caSemaine, caMois };
  }, [orders, w0, m0, now]);

  const goRole = useCallback(
    (role: 'waiter' | 'preparation' | 'cashier' | 'supervisor') => {
      if (!restaurantId) return;
      const base: any = {
        waiter: { pathname: '/restaurant/[id]/operations/waiter', params: { id: restaurantId } },
        preparation: {
          pathname: '/restaurant/[id]/operations/preparation',
          params: { id: restaurantId },
        },
        cashier: { pathname: '/restaurant/[id]/operations/cashier', params: { id: restaurantId } },
        supervisor: {
          pathname: '/restaurant/[id]/operations/supervisor',
          params: { id: restaurantId },
        },
      };
      router.push(base[role]);
    },
    [restaurantId],
  );

  const goParams = useCallback(() => {
    if (!restaurantId) return;
    router.push({ pathname: '/restaurant/[id]/params', params: { id: restaurantId } });
  }, [restaurantId]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ paddingBottom: spacing(4) }}
    >
      {/* Hero header */}
      <View
        style={{
          backgroundColor: C.brand,
          paddingTop: spacing(3),
          paddingBottom: spacing(3),
          paddingHorizontal: spacing(2),
          borderBottomLeftRadius: radius.lg,
          borderBottomRightRadius: radius.lg,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={[typography.subtitle, { color: C.neutral0, opacity: 0.9 }]}>Bienvenue</Text>
          <Text
            style={[
              typography.title,
              { color: C.neutral0, textAlign: 'center', marginTop: spacing(0.5) },
            ]}
          >
            {restaurantName}
          </Text>

          {/* Small chips */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing(1),
              marginTop: spacing(1.25),
            }}
          >
            <View
              style={{
                paddingHorizontal: spacing(1.25),
                paddingVertical: 6,
                borderRadius: radius.pill,
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <Text style={{ color: C.neutral0 }}>
                CA jour {fmtMoney(revenue.caJour)}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: spacing(1.25),
                paddingVertical: 6,
                borderRadius: radius.pill,
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <Text style={{ color: C.neutral0 }}>
                Cmd jour {ordersStats.closedDay}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick actions */}
      <View style={{ paddingHorizontal: spacing(2), marginTop: -spacing(2) }}>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: radius.lg,
            borderColor: C.border,
            borderWidth: 1,
            padding: spacing(1.5),
          }}
        >
          <Text style={[typography.defaultSemiBold, { marginBottom: spacing(1), color: C.text }]}>Actions rapides</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1.5) }}>
            <QuickCard title="Serveur" icon="restaurant-outline" color={C.accent} onPress={() => goRole('waiter')} />
            <QuickCard title="Préparation" icon="pizza-outline" color={C.brand} onPress={() => goRole('preparation')} />
            <QuickCard title="Caisse" icon="cash-outline" color={C.success} onPress={() => goRole('cashier')} />
            <QuickCard title="Superviseur" icon="bar-chart-outline" color={C.muted} onPress={() => goRole('supervisor')} />
            <QuickCard title="Paramètres" icon="settings-outline" color={C.accent} onPress={goParams} />
          </View>
        </View>
      </View>

      {/* Stat cards */}
      <View style={{ paddingHorizontal: spacing(2), marginTop: spacing(2) }}>
      <Card title="Commandes" icon="receipt-outline" bg={C.card} border={C.accent}>
        <StatRow label="Clôturées (jour)" value={ordersStats.closedDay} color={C.text} />
        <StatRow label="Clôturées (semaine)" value={ordersStats.closedWeek} color={C.text} />
        <StatRow label="Clôturées (mois)" value={ordersStats.closedMonth} color={C.text} />
        <Divider color={C.border} />
        <StatRow label="Brouillon" value={ordersStats.draft} color={C.muted} />
        <StatRow label="En préparation" value={ordersStats.prep} color={C.muted} />
        <StatRow label="Non payées" value={ordersStats.unpaid} color={C.danger} />
      </Card>

      <Card title="Produits" icon="fast-food-outline" bg={C.card} border={C.brand}>
        <StatRow label="Total produits" value={productStats.total} color={C.text} />
        <Divider color={C.border} />
        <StatRow label="Plus vendu" value={productStats.most} color={C.text} />
        <StatRow label="Moins vendu" value={productStats.least} color={C.text} />
      </Card>

      <Card title="Chiffre d’affaires" icon="cash-outline" bg={C.card} border={C.success}>
        <StatRow label="Aujourd’hui" value={fmtMoney(revenue.caJour)} color={C.text} />
        <StatRow label="Record journalier" value={fmtMoney(revenue.recordJour)} color={C.text} />
        <Divider color={C.border} />
        <StatRow label="Cette semaine" value={fmtMoney(revenue.caSemaine)} color={C.text} />
        <StatRow label="Ce mois" value={fmtMoney(revenue.caMois)} color={C.text} />
      </Card>

      <Card title="Ressources" icon="grid-outline" bg={C.card} border={C.neutral400}>
        <StatRow label="Tables" value={tables.length} color={C.text} />
        <StatRow label="Utilisateurs" value={users.length} color={C.text} />
      </Card>
      </View>
    </ScrollView>
  );
}

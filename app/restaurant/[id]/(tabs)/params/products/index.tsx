// app/restaurant/[id]/(tabs)/params/products/index.tsx
import { View, StyleSheet, Alert, ScrollView, Pressable } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ThemedText';
import IconButton from '@/components/ui/IconButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import ConfirmModal from '@/components/modals/ConfirmModal';

export default function ProductsIndex() {
  const products = useAppStore((s) => s.products);
  const categories = useAppStore((s) => s.categories);
  const deleteProduct = useAppStore((s) => s.deleteProduct);
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(undefined);

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer le produit', 'Voulez-vous vraiment supprimer ce produit ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteProduct(id) },
    ]);
  };

  const getCategoryName = (categoryId: string) => categories.find((c) => c.id === categoryId)?.name ?? '—';

  const availColor = (ok: boolean) => (ok ? C.success : C.danger);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const handleAskDelete = (id: string) => setDeleteId(id);
  const handleConfirmDelete = () => {
    if (deleteId) deleteProduct(deleteId);
    setDeleteId(null);
  };
  const handleCancelDelete = () => setDeleteId(null);

  // (Menu retiré au profit de 3 icônes inline)

  const filtered = useMemo(
    () => (selectedCatId ? products.filter((p) => p.categoryId === selectedCatId) : products),
    [products, selectedCatId],
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.background }} contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(6) }}>
      {/* Hero compact */}
      <View style={[styles.header, { backgroundColor: C.brand }]}> 
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing(1.25) }}>
          <View style={styles.heroIcon}>
            <Ionicons name="pricetag-outline" size={22} color={C.neutral0} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={{ color: C.neutral0, fontSize: 18 }}>Produits</ThemedText>
            <ThemedText style={{ color: 'rgba(255,255,255,0.95)' }}>{products.length} produit(s) configuré(s)</ThemedText>
          </View>
        </View>
        <IconButton
          testID="add-product"
          icon="add-outline"
          variant="solid"
          size="lg"
          onPress={() =>
            router.push({
              pathname: '/restaurant/[id]/(tabs)/params/products/create',
              params: { id: currentRestaurantId! },
            })
          }
        />
      </View>

      {/* Filtres catégories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing(1) }}>
        <Pressable
          onPress={() => setSelectedCatId(undefined)}
          style={[styles.catChip, selectedCatId === undefined && { backgroundColor: C.brand }]}
        >
          <ThemedText style={{ color: selectedCatId === undefined ? C.neutral0 : C.muted }}>Toutes</ThemedText>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setSelectedCatId(cat.id)}
            style={[styles.catChip, selectedCatId === cat.id && { backgroundColor: C.brand }]}
          >
            <ThemedText style={{ color: selectedCatId === cat.id ? C.neutral0 : C.muted }}>{cat.name}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Ionicons name="pricetag-outline" size={18} color={C.muted} />
          <ThemedText style={{ color: C.muted }}>Aucun produit défini</ThemedText>
        </View>
      ) : (
        <View style={{ gap: spacing(1) }}>
          {filtered.map((p) => (
            <Pressable
              key={p.id}
              testID={`product-row-${p.id}`}
              android_ripple={{ color: C.ripple }}
              style={[styles.row, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() =>
                router.push({
                  pathname: '/restaurant/[id]/(tabs)/params/products/[productId]',
                  params: { id: currentRestaurantId!, productId: p.id },
                })
              }
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ThemedText type="defaultSemiBold" style={{ color: C.text, flex: 1 }}>
                    {p.name}
                  </ThemedText>
                  <ThemedText style={{ color: C.muted, fontSize: 12 }}>{getCategoryName(p.categoryId)}</ThemedText>
                </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1), marginTop: 4 }}>
                <View style={[styles.chip, { borderColor: C.border, backgroundColor: C.surface }]}>
                  <Ionicons name="cash-outline" size={14} color={C.muted} />
                  <ThemedText style={{ color: C.muted, fontSize: 12 }}>{p.price} FCFA</ThemedText>
                </View>
                <View style={{ flex: 1 }} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <IconButton
                    testID={`product-view-${p.id}`}
                    icon="eye-outline"
                    variant="outline"
                    onPress={() =>
                      router.push({
                        pathname: '/restaurant/[id]/(tabs)/params/products/[productId]',
                        params: { id: currentRestaurantId!, productId: p.id },
                      })
                    }
                  />
                  <IconButton
                    testID={`product-edit-${p.id}`}
                    icon="create-outline"
                    variant="outline"
                    onPress={() =>
                      router.push({
                        pathname: '/restaurant/[id]/(tabs)/params/products/[productId]/edit',
                        params: { id: currentRestaurantId!, productId: p.id },
                      })
                    }
                  />
                  <IconButton
                    testID={`product-delete-${p.id}`}
                    icon="trash-outline"
                    variant="danger"
                    onPress={() => handleAskDelete(p.id)}
                  />
                </View>
              </View>
            </View>
            </Pressable>
          ))}
        </View>
      )}
      <ConfirmModal
        visible={!!deleteId}
        title="Supprimer le produit"
        message="Voulez-vous vraiment supprimer ce produit ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing(1.5),
    marginBottom: spacing(2),
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(1.25),
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  catChip: {
    paddingHorizontal: spacing(1.25),
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: spacing(1),
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  empty: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(1.5),
    alignItems: 'center',
    gap: spacing(0.5),
  },
});

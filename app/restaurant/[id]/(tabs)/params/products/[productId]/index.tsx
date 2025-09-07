import { useLocalSearchParams, router } from 'expo-router';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';
import Button from '@/components/ui/Button';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function ProductDetail() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const products = useAppStore((s) => s.products);
  const categories = useAppStore((s) => s.categories);
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const product = products.find((t) => t.id === productId);

  if (!product) {
    return (
      <View style={styles.center}>
        <ThemedText>Aucun produit trouvé.</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(6) }}
    >
      {/* Hero compact */}
      <View
        style={{
          backgroundColor: C.brand,
          borderRadius: radius.lg,
          padding: spacing(1.75),
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing(1.25),
          marginBottom: spacing(2),
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.15)',
          }}
        >
          <Ionicons name="pricetag-outline" size={22} color={C.neutral0} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold" style={{ color: C.neutral0, fontSize: 18 }}>
            {product.name}
          </ThemedText>
          <ThemedText style={{ color: 'rgba(255,255,255,0.95)' }}>Détails du produit</ThemedText>
        </View>
      </View>

      {/* Card de contenu */}
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
        <Row
          label="Catégorie"
          value={categories.find((c) => c.id === product.categoryId)?.name ?? '—'}
        />
        <Row label="Prix" value={`${product.price} FCFA`} />
        <Row label="Disponible" value={product.isAvailable ? 'Oui' : 'Non'} />
        <Row label="Description" value={product.description || '—'} />
      </View>

      <View style={styles.actions}>
        <Button
          fullWidth
          size="lg"
          onPress={() =>
            router.push({
              pathname: '/restaurant/[id]/(tabs)/params/products/[productId]/edit',
              params: { id: product.restaurantId, productId: product.id },
            })
          }
        >
          Modifier
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    marginTop: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    gap: spacing(1),
  },
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <ThemedText style={{ opacity: 0.65 }}>{label}</ThemedText>
      <ThemedText>{value}</ThemedText>
    </View>
  );
}

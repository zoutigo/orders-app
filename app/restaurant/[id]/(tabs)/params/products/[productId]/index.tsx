import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';
import Button from '@/components/ui/Button';

export default function ProductDetail() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const products = useAppStore((s) => s.products);
  const product = products.find((t) => t.id === productId);

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Aucun produit trouvée.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Text>Disponible : {product.isAvailable}</Text>
      <Text>Places : {product.categoryId}</Text>
      <Text>Description : {product.description || '—'}</Text>
      <Text>Disponible : {product.isAvailable ? 'Oui' : 'Non'}</Text>

      <View style={styles.actions}>
        <Button
          fullWidth
          size="lg"
          onPress={() =>
            router.push(
              `/restaurant/${product.restaurantId}/(tabs)/params/products/${product.id}/edit`,
            )
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actions: {
    marginTop: 20,
  },
});

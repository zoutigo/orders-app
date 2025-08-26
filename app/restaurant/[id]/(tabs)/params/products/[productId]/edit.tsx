// app/restaurant/[id]/(tabs)/params/products/[productId]/update.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';
import ProductForm from '@/components/auth/ProductForm';

export default function UpdateProduct() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const products = useAppStore((s) => s.products);

  // On cherche la product par son id
  const product = products.find((t) => t.id === productId);

  useEffect(() => {
    if (!currentRestaurantId) {
      router.replace('/tabs');
    }
  }, [currentRestaurantId]);

  if (!currentRestaurantId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      }}
    >
      <ProductForm restaurantId={currentRestaurantId} product={product} />
    </ScrollView>
  );
}

// app/restaurant/[id]/(tabs)/params/products/index.tsx
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ThemedText';
import IconButton from '@/components/ui/IconButton';

export default function ProductsIndex() {
  const products = useAppStore((s) => s.products);
  const deleteProduct = useAppStore((s) => s.deleteProduct);
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer le produit', 'Voulez-vous vraiment supprimer ce produit ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteProduct(id) },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        fullWidth
        size="lg"
        onPress={() =>
          router.push(`/restaurant/${currentRestaurantId}/params/products/create`)
        }
      >
        Ajouter une produit
      </Button>

      {products.length === 0 ? (
        <ThemedText style={{ marginTop: 20 }}>Aucune produit définie</ThemedText>
      ) : (
        products.map((t) => (
          <View key={t.id} style={styles.row}>
            <ThemedText>{t.name}</ThemedText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <IconButton
                icon="eye-off-sharp"
                onPress={() =>
                  router.push(`/restaurant/${currentRestaurantId}/params/products/${t.id}`)
                }
              />
              <IconButton
                icon="create-outline"
                onPress={() =>
                  router.push(
                    `/restaurant/${currentRestaurantId}/params/products/${t.id}/edit`,
                  )
                }
              />
              <IconButton icon="trash-outline" onPress={() => handleDelete(t.id)} />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
});

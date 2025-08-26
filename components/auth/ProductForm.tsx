// components/forms/ProductForm.tsx
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { useAppStore } from '@/hooks/useAppStore';
import FormCard from '../ui/FormCard';
import ThemedInputText from '@/components/ui/ThemedInputText';
import Button from '@/components/ui/Button';
import { Product, Category } from '@/types';
import { Picker } from '@react-native-picker/picker';
import { Switch, View, Text } from 'react-native';

type ProductFormData = {
  name: string;
  categoryId: string;
  price: number;
  description: string;
  isAvailable: boolean;
};

export default function ProductForm({
  restaurantId,
  product,
}: {
  restaurantId: string;
  product?: Product;
}) {
  const addProduct = useAppStore((s) => s.addProduct);
  const updateProduct = useAppStore((s) => s.updateProduct);
  const categories = useAppStore((s) => s.categories);
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);

  const { control, handleSubmit, formState } = useForm<ProductFormData>({
    defaultValues: product
      ? {
          name: product.name,
          categoryId: product.categoryId,
          price: product.price,
          description: product.description || '',
          isAvailable: product.isAvailable,
        }
      : {
          name: '',
          categoryId: categories[0]?.id || '',
          price: 0,
          description: '',
          isAvailable: true,
        },
    mode: 'onChange',
  });

  const { isSubmitting, isValid } = formState;

  const onSubmit = (data: ProductFormData) => {
    try {
      if (product) {
        updateProduct(product.id, { ...data });
        Toast.show({
          type: 'success',
          text1: 'Succès',
          text2: `Produit "${data.name}" mis à jour ✅`,
          visibilityTime: 1500,
        });
        setTimeout(() => {
          router.replace(`/restaurant/${currentRestaurantId}/(tabs)/params/products/${product.id}`);
        }, 1200);
      } else {
        addProduct({
          id: Math.random().toString(36).slice(2, 9),
          restaurantId,
          ...data,
        });
        Toast.show({
          type: 'success',
          text1: 'Succès',
          text2: `Produit "${data.name}" créé 🍽️`,
          visibilityTime: 1500,
        });
        setTimeout(() => {
          router.back();
        }, 800);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message || 'Impossible de sauvegarder le produit',
      });
    }
  };

  return (
    <FormCard>
      <ThemedInputText
        name="name"
        control={control}
        label="Nom du produit"
        placeholder="Ex: Poulet DG"
        icon="fast-food-outline"
        rules={{
          required: 'Le nom est requis',
          minLength: { value: 2, message: '2 caractères minimum' },
        }}
      />

      {/* Catégorie */}
      <Controller
        control={control}
        name="categoryId"
        render={({ field: { onChange, value } }) => (
          <View style={{ marginVertical: 12 }}>
            <Text style={{ marginBottom: 6 }}>Catégorie</Text>
            <Picker selectedValue={value} onValueChange={onChange}>
              {categories.map((cat: Category) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        )}
      />

      {/* Prix */}
      <ThemedInputText
        name="price"
        control={control}
        label="Prix"
        placeholder="Ex: 3500"
        keyboardType="numeric"
        icon="cash-outline"
        rules={{
          required: 'Le prix est requis',
          min: { value: 100, message: 'Le prix doit être supérieur à 100' },
        }}
      />

      {/* Description */}
      <ThemedInputText
        name="description"
        control={control}
        label="Description"
        placeholder="Décrivez le produit..."
        icon="document-text-outline"
        rules={{ minLength: { value: 5, message: '5 caractères minimum' } }}
      />

      {/* isAvailable */}
      <Controller
        control={control}
        name="isAvailable"
        render={({ field: { onChange, value } }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 12,
            }}
          >
            <Text>Disponible à la commande</Text>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />

      <Button
        fullWidth
        size="lg"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || !isValid}
        style={{ marginTop: 20 }}
      >
        {product ? 'Mettre à jour' : 'Créer le produit'}
      </Button>
    </FormCard>
  );
}

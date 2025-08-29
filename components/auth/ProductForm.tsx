// components/forms/ProductForm.tsx
import { router } from 'expo-router';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { View, Text, Switch, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '@/hooks/useAppStore';
import FormCard from '@/components/ui/FormCard';
import ThemedInputText, { ThemedInputBase } from '@/components/ui/ThemedInputText';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import type { Product, Category } from '@/types';

type ProductFormData = {
  name: string;
  categoryId: string;
  price: number;
  description: string;
  isAvailable: boolean;
  unit: string;
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

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<ProductFormData>({
    mode: 'onChange',
    defaultValues: product
      ? {
          name: product.name,
          categoryId: product.categoryId,
          price: product.price,
          description: product.description ?? '',
          isAvailable: product.isAvailable,
          unit: product.unit ?? '',
        }
      : {
          name: '',
          categoryId: categories[0]?.id ?? '',
          price: 0,
          description: '',
          isAvailable: true,
          unit: '',
        },
  });

  const onSubmit = (data: ProductFormData) => {
    try {
      const payload: ProductFormData = {
        ...data,
        price: Number.isFinite(data.price) ? data.price : 0,
        unit: data.unit.trim(),
        description: data.description?.trim() ?? '',
      };

      if (product) {
        // updateProduct accepte Partial<Product>
        updateProduct(product.id, payload as Partial<Product>);
        Toast.show({
          type: 'success',
          text1: 'Succès',
          text2: `Produit "${payload.name}" mis à jour ✅`,
          visibilityTime: 1500,
        });
        setTimeout(() => {
          router.replace(`/restaurant/${currentRestaurantId}/(tabs)/params/products/${product.id}`);
        }, 900);
      } else {
        // ⬇️ Construction d'un Product COMPLET pour addProduct
        const newProduct: Product = {
          id: Math.random().toString(36).slice(2, 9),
          restaurantId,
          name: payload.name,
          categoryId: payload.categoryId,
          price: payload.price,
          description: payload.description,
          isAvailable: payload.isAvailable,
          unit: payload.unit, // ✅ obligatoire
        };

        addProduct(newProduct);

        Toast.show({
          type: 'success',
          text1: 'Succès',
          text2: `Produit "${payload.name}" créé 🍽️`,
          visibilityTime: 1500,
        });
        setTimeout(() => router.back(), 700);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error?.message ?? 'Impossible de sauvegarder le produit',
      });
    }
  };

  const C = Colors.light; // si tu gères le thème, remplace par useColorScheme()

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1 }}
    >
      <FormCard cardStyle={{ paddingVertical: spacing(2), paddingHorizontal: spacing(2) }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing(2) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Nom */}
          <ThemedInputText
            name="name"
            control={control}
            label="Nom du produit"
            placeholder="Ex: Poulet DG"
            icon="fast-food-outline"
            autoCapitalize="sentences"
            returnKeyType="next"
            rules={{
              required: 'Le nom est requis',
              minLength: { value: 2, message: '2 caractères minimum' },
              maxLength: { value: 60, message: '60 caractères maximum' },
            }}
          />

          {/* Catégorie */}
          <Controller
            control={control}
            name="categoryId"
            rules={{ required: 'La catégorie est requise' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={{ marginBottom: spacing(2) }}>
                <Text style={{ marginBottom: 6, color: C.text, fontWeight: '600' }}>Catégorie</Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: error ? C.danger : C.border,
                    borderRadius: radius.md,
                    overflow: 'hidden',
                  }}
                >
                  <Picker selectedValue={value} onValueChange={onChange}>
                    {categories.map((cat: Category) => (
                      <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                    ))}
                  </Picker>
                </View>

                {error && (
                  <Text style={{ marginTop: 6, color: C.danger, fontSize: 13 }}>
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Prix (number) */}
          <Controller
            control={control}
            name="price"
            rules={{
              required: 'Le prix est requis',
              min: { value: 100, message: 'Le prix doit être ≥ 100' },
              validate: (v) => Number.isFinite(v) || 'Prix invalide',
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <ThemedInputBase
                label="Prix"
                placeholder="Ex: 3500"
                icon="cash-outline"
                keyboardType="numeric"
                value={String(value ?? '')}
                onChangeText={(txt) => {
                  const n = Number((txt || '').replace(/[^\d]/g, ''));
                  onChange(Number.isFinite(n) ? n : 0);
                }}
                onBlur={onBlur}
                errorMessage={error?.message}
                rightAdornment={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="pricetag-outline" size={16} color="#999" />
                    <Text style={{ color: '#999' }}>FCFA</Text>
                  </View>
                }
              />
            )}
          />

          {/* Unité (OBLIGATOIRE) */}
          <ThemedInputText
            name="unit"
            control={control}
            label="Unité"
            placeholder="Ex: pièce, part, kg, verre…"
            icon="cube-outline"
            autoCapitalize="none"
            rules={{
              required: "L'unité est requise",
              minLength: { value: 1, message: '1 caractère minimum' },
              maxLength: { value: 20, message: '20 caractères maximum' },
            }}
          />

          {/* Description */}
          <ThemedInputText
            name="description"
            control={control}
            label="Description"
            placeholder="Décrivez le produit…"
            icon="document-text-outline"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            rules={{
              minLength: { value: 5, message: '5 caractères minimum' },
              maxLength: { value: 280, message: '280 caractères maximum' },
            }}
          />

          {/* Disponible */}
          <Controller
            control={control}
            name="isAvailable"
            render={({ field: { onChange, value } }) => (
              <View
                style={{
                  marginTop: spacing(1),
                  marginBottom: spacing(2),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: C.text, fontWeight: '600' }}>Disponible à la commande</Text>
                <Switch value={value} onValueChange={onChange} />
              </View>
            )}
          />

          <Button
            fullWidth
            size="lg"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || !isValid}
            style={{ marginTop: spacing(1) }}
            leftIcon={product ? 'save-outline' : 'add-circle-outline'}
          >
            {product ? 'Mettre à jour' : 'Créer le produit'}
          </Button>
        </ScrollView>
      </FormCard>
    </KeyboardAvoidingView>
  );
}

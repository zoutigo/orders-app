// components/forms/RestaurantForm.tsx
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';

import { useAppStore } from '@/hooks/useAppStore';
import FormCard from '@/components/ui/FormCard';
import ThemedInputText from '@/components/ui/ThemedInputText';
import Button from '@/components/ui/Button';
import { spacing, radius } from '@/constants/theme';

type RestaurantFormData = {
  name: string;
  specialty: string;
  address: string;
  description: string;
};

export default function RestaurantForm() {
  const addRestaurant = useAppStore((s) => s.addRestaurant);
  const setCurrentRestaurant = useAppStore((s) => s.setCurrentRestaurant);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<RestaurantFormData>({
    defaultValues: { name: '', specialty: '', address: '', description: '' },
    mode: 'onChange',
  });

  const onSubmit = (data: RestaurantFormData) => {
    try {
      const id = Math.random().toString(36).slice(2, 9);

      addRestaurant({
        id,
        name: data.name.trim(),
        specialty: data.specialty.trim(),
        address: data.address.trim(),
        description: data.description.trim(),
      });

      setCurrentRestaurant(id);

      Toast.show({
        type: 'success',
        text1: 'Restaurant créé',
        text2: `« ${data.name} » a été ajouté avec succès 🍽️`,
        visibilityTime: 1500,
      });

      // Retour à la section Restaurants (ou la page précédente)
      router.replace('/tabs/restaurants');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error?.message ?? 'Impossible de créer le restaurant',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1 }}
    >
      <FormCard
        cardStyle={{
          paddingVertical: spacing(2),
          paddingHorizontal: spacing(2),
          borderRadius: radius.lg,
        }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing(2) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedInputText
            name="name"
            control={control}
            label="Nom du restaurant"
            placeholder="Ex : Le Gourmet"
            icon="home-outline"
            autoCapitalize="words"
            rules={{
              required: 'Le nom est requis',
              minLength: { value: 2, message: '2 caractères minimum' },
              maxLength: { value: 60, message: '60 caractères maximum' },
            }}
          />

          <ThemedInputText
            name="specialty"
            control={control}
            label="Spécialité"
            placeholder="Ex : Italien, Africain…"
            icon="fast-food-outline"
            autoCapitalize="sentences"
            rules={{
              required: 'La spécialité est requise',
              minLength: { value: 2, message: '2 caractères minimum' },
              maxLength: { value: 40, message: '40 caractères maximum' },
            }}
          />

          <ThemedInputText
            name="address"
            control={control}
            label="Adresse"
            placeholder="Ex : 12 rue des Oliviers, Yaoundé"
            icon="location-outline"
            autoCapitalize="sentences"
            rules={{
              required: "L'adresse est requise",
              minLength: { value: 4, message: 'Adresse trop courte' },
              maxLength: { value: 120, message: '120 caractères maximum' },
            }}
          />

          <ThemedInputText
            name="description"
            control={control}
            label="Description"
            placeholder="Quelques mots sur le lieu, l’ambiance, etc."
            icon="document-text-outline"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            rules={{
              minLength: { value: 10, message: '10 caractères minimum' },
              maxLength: { value: 300, message: '300 caractères maximum' },
            }}
          />

          {/* Actions */}
          <View style={{ gap: spacing(1), marginTop: spacing(1) }}>
            <Button
              fullWidth
              size="lg"
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || !isValid}
              leftIcon="save-outline"
            >
              Créer le restaurant
            </Button>

            <Button
              fullWidth
              size="md"
              variant="outline"
              onPress={() => router.back()}
              leftIcon="arrow-undo-outline"
            >
              Annuler
            </Button>
          </View>
        </ScrollView>
      </FormCard>
    </KeyboardAvoidingView>
  );
}

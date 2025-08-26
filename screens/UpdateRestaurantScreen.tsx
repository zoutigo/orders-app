// app/tabs/restaurants/[id]/update.tsx
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Button from '@/components/ui/Button';
import ThemedInputText from '@/components/ui/ThemedInputText';
import Toast from 'react-native-toast-message';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';

type RestaurantForm = {
  name: string;
  specialty: string;
  address: string;
  description: string;
};

export default function UpdateRestaurantScreen() {
  const cardBg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');

  const { id } = useLocalSearchParams<{ id: string }>();

  const restaurant = useAppStore((s) => s.restaurants.find((r) => r.id === id));
  const updateRestaurant = useAppStore((s) => s.updateRestaurant);

  const { control, handleSubmit, formState } = useForm<RestaurantForm>({
    defaultValues: {
      name: restaurant?.name ?? '',
      specialty: restaurant?.specialty ?? '',
      address: restaurant?.address ?? '',
      description: restaurant?.description ?? '',
    },
    mode: 'onChange',
  });

  const { isSubmitting, isValid } = formState;

  const onSubmit = (data: RestaurantForm) => {
    if (!id) return;

    try {
      updateRestaurant(id, data);

      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: `Restaurant "${data.name}" mis à jour ✅`,
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message || 'Impossible de mettre à jour',
      });
    }
  };

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <ThemedText type="title" style={{ color: 'red' }}>
          Restaurant introuvable ❌
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <ThemedText type="title" style={{ marginBottom: 24, color: text }}>
          Modifier le restaurant
        </ThemedText>

        <ThemedInputText
          name="name"
          control={control}
          label="Nom du restaurant"
          placeholder="Ex: Le Gourmet"
          icon="home-outline"
          rules={{
            required: 'Le nom est requis',
            minLength: { value: 2, message: '2 caractères minimum' },
          }}
        />

        <ThemedInputText
          name="specialty"
          control={control}
          label="Spécialité"
          placeholder="Ex: Italien, Africain..."
          icon="fast-food-outline"
          rules={{ required: 'La spécialité est requise' }}
        />

        <ThemedInputText
          name="address"
          control={control}
          label="Adresse"
          placeholder="Ex: 12 rue des Oliviers"
          icon="location-outline"
          rules={{ required: "L'adresse est requise" }}
        />

        <ThemedInputText
          name="description"
          control={control}
          label="Description"
          placeholder="Décrivez votre restaurant..."
          icon="document-text-outline"
          rules={{ minLength: { value: 10, message: '10 caractères minimum' } }}
        />

        <Button
          fullWidth
          size="lg"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || !isValid}
        >
          Mettre à jour
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    padding: 4,
  },
  card: {
    width: '90%',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 30,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
    gap: 16,
  },
});

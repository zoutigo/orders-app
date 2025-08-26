// components/forms/RestaurantForm.tsx
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { useAppStore } from '@/hooks/useAppStore';
import FormCard from '../ui/FormCard';
import ThemedInputText from '@/components/ui/ThemedInputText';
import Button from '@/components/ui/Button';

type RestaurantFormData = {
  name: string;
  specialty: string;
  address: string;
  description: string;
};

export default function RestaurantForm() {
  const addRestaurant = useAppStore((s) => s.addRestaurant);

  const { control, handleSubmit, formState } = useForm<RestaurantFormData>({
    defaultValues: { name: '', specialty: '', address: '', description: '' },
    mode: 'onChange',
  });

  const { isSubmitting, isValid } = formState;

  const onSubmit = (data: RestaurantFormData) => {
    try {
      addRestaurant({
        id: Math.random().toString(36).slice(2, 9),
        name: data.name,
        specialty: data.specialty,
        address: data.address,
        description: data.description,
      });

      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: `Restaurant "${data.name}" ajouté 🍽️`,
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message || 'Impossible de créer le restaurant',
      });
    }
  };

  return (
    <FormCard>
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
        Créer le restaurant
      </Button>
    </FormCard>
  );
}

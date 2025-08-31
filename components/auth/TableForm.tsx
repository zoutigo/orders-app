// components/forms/TableForm.tsx
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { useAppStore } from '@/hooks/useAppStore';
import FormCard from '../ui/FormCard';
import ThemedInputText from '@/components/ui/ThemedInputText';
import Button from '@/components/ui/Button';
import { Table, TableStatus } from '@/types';
import { Picker } from '@react-native-picker/picker';
import { Switch, View, Text } from 'react-native';

type TableFormData = {
  name: string;
  seats: number;
  description: string;
  status: TableStatus;
  isUsable: boolean;
};

export default function TableForm({
  restaurantId,
  table,
}: {
  restaurantId: string;
  table?: Table;
}) {
  const addTable = useAppStore((s) => s.addTable);
  const updateTable = useAppStore((s) => s.updateTable);
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);

  const { control, handleSubmit, formState } = useForm<TableFormData>({
    defaultValues: table
      ? {
          name: table.name,
          seats: table.seats,
          description: table.description || '',
          status: table.status,
          isUsable: table.isUsable,
        }
      : {
          name: '',
          seats: 0,
          description: '',
          status: 'LIBRE',
          isUsable: true,
        },
    mode: 'onChange',
  });

  const { isSubmitting, isValid } = formState;

  const onSubmit = (data: TableFormData) => {
    try {
      if (table) {
        updateTable(table.id, { ...data });
        Toast.show({
          type: 'success',
          text1: 'Succès',
          text2: `Table "${data.name}" mise à jour ✅`,
        });
        setTimeout(() => {
          router.replace(`/restaurant/${currentRestaurantId}/params/tables/${table.id}`);
        }, 1200);
      } else {
        addTable({
          id: Math.random().toString(36).slice(2, 9),
          restaurantId,
          ...data,
        });
        Toast.show({
          type: 'success',
          text1: 'Succès',
          text2: `Table "${data.name}" créée 🍽️`,
        });
      }
      setTimeout(() => {
        router.back();
      }, 800);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message || 'Impossible de sauvegarder la table',
      });
    }
  };

  return (
    <FormCard>
      <ThemedInputText
        name="name"
        control={control}
        label="Nom de la table"
        placeholder="Table 1 ou VIP"
        icon="home-outline"
        rules={{
          required: 'Le nom est requis',
          minLength: { value: 1, message: '1 caractère minimum' },
        }}
      />

      <ThemedInputText
        name="seats"
        control={control}
        label="Nombre de places"
        placeholder="Ex: 4"
        keyboardType="numeric"
        icon="people-outline"
        rules={{
          required: 'Nombre de places requis',
          min: { value: 1, message: 'Il faut au moins 1 place' },
        }}
      />

      <ThemedInputText
        name="description"
        control={control}
        label="Description"
        placeholder="Décrivez la table..."
        icon="document-text-outline"
        rules={{ minLength: { value: 5, message: '5 caractères minimum' } }}
      />

      {/* Status */}
      <Controller
        control={control}
        name="status"
        render={({ field: { onChange, value } }) => (
          <View style={{ marginVertical: 12 }}>
            <Text style={{ marginBottom: 6 }}>Statut</Text>
            <Picker selectedValue={value} onValueChange={onChange}>
              <Picker.Item label="Libre" value="LIBRE" />
              <Picker.Item label="Occupée" value="OCCUPEE" />
              <Picker.Item label="En service" value="EN_SERVICE" />
            </Picker>
          </View>
        )}
      />

      {/* isUsable */}
      <Controller
        control={control}
        name="isUsable"
        render={({ field: { onChange, value } }) => (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text>Disponible à l’usage</Text>
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
        {table ? 'Mettre à jour' : 'Créer la table'}
      </Button>
    </FormCard>
  );
}

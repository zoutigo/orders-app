// app/tabs/restaurants/create.tsx
import { View, ScrollView } from 'react-native';
import Toolbar from '@/components/ui/Toolbar';
import ToolbarSpacer from '@/components/ui/ToolbarSpacer';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { spacing } from '@/constants/theme';
import RestaurantForm from '@/components/auth/RestaurantForm';

export default function TabsRestaurantsCreateScreen() {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      {/* Toolbar sticky en haut */}
      <Toolbar title="Nouveau restaurant" back />
      <ToolbarSpacer customHeight={20} />

      {/* Contenu défilant */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing(2),
          paddingBottom: spacing(4),
        }}
        keyboardShouldPersistTaps="handled"
      >
        <RestaurantForm />
      </ScrollView>
    </View>
  );
}

// app/restaurant/[id]/(tabs)/params/tables/[tableId]/update.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';
import TableForm from '@/components/auth/TableForm';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function UpdateTable() {
  const { tableId } = useLocalSearchParams<{ tableId: string }>();
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const tables = useAppStore((s) => s.tables);
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  // On cherche la table par son id
  const table = tables.find((t) => t.id === tableId);

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

  if (!table) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1, backgroundColor: C.background }}
        contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(36) }}
      >
        {/* Hero compact */}
        <View
          style={{
            backgroundColor: C.brand,
            borderRadius: radius.lg,
            padding: spacing(1.75),
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing(1.25),
            marginBottom: spacing(2),
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <Ionicons name="create-outline" size={22} color={C.neutral0} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={{ color: C.neutral0, fontSize: 18 }}>
              Modifier la table
            </ThemedText>
            <ThemedText style={{ color: 'rgba(255,255,255,0.95)' }}>
              Mettez à jour les informations de la table
            </ThemedText>
          </View>
        </View>

        <TableForm restaurantId={currentRestaurantId} table={table} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

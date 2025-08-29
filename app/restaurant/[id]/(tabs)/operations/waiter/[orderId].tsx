// app/waiter/[orderId].tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import WaiterOrderScreen from '@/screens/WaiterOrderScreen';

// ⚠️ Vérifie bien le nom du fichier que tu as créé :
// - si c’est vraiment "WaiterOderScreen.tsx" => garde tel quel
// - si c’est "WaiterOrderScreen.tsx" => corrige ici l’import

export default function WaiterOrderRoute() {
  const params = useLocalSearchParams<{ orderId?: string | string[] }>();
  const navigation = useNavigation();

  // Sécurisation du paramètre orderId
  const orderId =
    typeof params.orderId === 'string'
      ? params.orderId
      : Array.isArray(params.orderId)
        ? params.orderId[0]
        : undefined;

  // Met à jour le header avec un titre dynamique
  useEffect(() => {
    if (orderId) {
      navigation.setOptions?.({
        title: `Commande ${orderId}`,
      });
    }
  }, [orderId, navigation]);

  // Si pas d’orderId, affiche un fallback
  if (!orderId) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text>Commande introuvable (paramètre orderId manquant)</Text>
      </View>
    );
  }

  // Retourne l’écran principal
  return <WaiterOrderScreen orderId={orderId} />;
}

import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/ui/Button';
import { View } from 'react-native';
import { useAppStore } from '@/hooks/useAppStore';
import { router } from 'expo-router';

export default function RestaurantDisconnect() {
  const logout = useAppStore((s) => s.logout);
  const setCurrentRestaurant = useAppStore((s) => s.setCurrentRestaurant);

  const handleRestaurantDisconnect = () => {
    setCurrentRestaurant(undefined);
    router.replace('/tabs'); // retour vers liste des restaurants
  };

  const handleFullDisconnect = () => {
    setCurrentRestaurant(undefined);
    logout();
    router.replace('/login'); // retour à l’écran de connexion
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <ThemedText style={{ textAlign: 'center', marginBottom: 20 }}>
        Veuillez choisir une option de déconnexion :
      </ThemedText>

      {/* Déconnexion du restaurant uniquement */}
      <Button
        fullWidth
        variant="outline"
        size="lg"
        leftIcon="storefront-outline"
        onPress={handleRestaurantDisconnect}
        style={{ marginBottom: 16 }}
      >
        Quitter ce restaurant
      </Button>

      {/* Déconnexion totale (restaurant + application) */}
      <Button
        fullWidth
        variant="danger"
        size="lg"
        leftIcon="log-out-outline"
        onPress={handleFullDisconnect}
      >
        Déconnexion complète
      </Button>
    </View>
  );
}

import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import TabScreen from '@/screens/TabScreen';
import Card from '@/components/ui/Card';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import ButtonGroup from '@/components/ui/ButtonGroup';
import { useAppStore } from '@/hooks/useAppStore';
import { ThemedText } from '@/components/ThemedText';

export default function CommandesScreen() {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];
  const [showRestaurants, setShowRestaurant] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // 🟢 Récupère user + restaurants depuis le store
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const restaurants = useAppStore((s) => s.restaurants);
  const setCurrentRestaurant = useAppStore((s) => s.setCurrentRestaurant);

  const currentUser = users.find((u) => u.id === currentUserId);

  // Titre : si utilisateur => "Prénom Nom", sinon "Application Commandes"
  const title = currentUser
    ? `${currentUser.firstname} ${currentUser.lastname}`
    : 'Application Commandes';

  return (
    <TabScreen title={title} scrollable>
      <View style={styles.section}>
        {/* Profil utilisateur */}
        <Card
          title="Profil utilisateur"
          icon="person"
          onPress={() => router.push('/tabs/profile')}
          customColor={C.brand} // teal
        />

        {/* Bloc Restaurants */}
        <View>
          <Card
            title="Mes restaurants"
            icon="home"
            onPress={() => setShowRestaurant(!showRestaurants)}
            customColor={C.brand} // teal
          />
          {showRestaurants && (
            <ButtonGroup
              fullWidth
              direction="column"
              style={[
                {
                  borderColor: C.brand,
                  borderWidth: 1,
                  paddingVertical: 8,
                  paddingLeft: 25,
                  paddingRight: 8,
                  borderRadius: 8,
                },
              ]}
            >
              {/* Action créer */}
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <IconButton icon="add" onPress={() => router.push('/tabs/restaurants/create')} />
                <ThemedText>Créer un restaurant</ThemedText>
              </View>

              {/* Liste des restaurants */}
              {restaurants.length === 0 ? (
                <ThemedText style={{ color: C.muted }}>
                  Aucun restaurant créé pour l’instant
                </ThemedText>
              ) : (
                restaurants.map((resto) => (
                  <Card
                    key={resto.id}
                    title={resto.name}
                    icon="storefront-outline"
                    onPress={() => {
                      setCurrentRestaurant(resto.id);
                      router.push(`/restaurant/${resto.id}/(tabs)/home`);
                    }}
                    customColor={C.accent}
                  />
                ))
              )}
            </ButtonGroup>
          )}
        </View>

        {/* Bloc Aide & Support */}
        <View>
          <Card
            title="Aide & Support"
            icon="help-circle"
            onPress={() => setShowHelp(!showHelp)}
            customColor={C.brand} // teal
          />
          {showHelp && (
            <ButtonGroup
              fullWidth
              direction="column"
              style={[
                {
                  borderColor: C.brand,
                  borderWidth: 1,
                  paddingVertical: 8,
                  paddingLeft: 25,
                  paddingRight: 8,
                  borderRadius: 8,
                },
              ]}
            >
              <Button
                size="md"
                leftIcon="book-outline"
                style={{ minWidth: '100%', flex: 1, justifyContent: 'flex-start' }}
              >
                Manuel utilisateur
              </Button>
              <Button
                size="md"
                leftIcon="help-circle-outline"
                style={{ minWidth: '100%', flex: 1, justifyContent: 'flex-start' }}
              >
                Questions fréquentes
              </Button>
              <Button
                size="md"
                leftIcon="bulb-outline"
                style={{ minWidth: '100%', flex: 1, justifyContent: 'flex-start' }}
              >
                Bugs et suggestions
              </Button>
            </ButtonGroup>
          )}
        </View>
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    marginBottom: 24,
  },
});

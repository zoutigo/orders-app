import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import TabScreen from '@/screens/TabScreen';
import Card from '@/components/ui/Card';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import ButtonGroup from '@/components/ui/ButtonGroup';

export default function CommandesScreen() {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];
  const [showRestaurants, setShowRestaurant] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  return (
    <TabScreen title="Application Commandes" scrollable>
      <View style={styles.section}>
        {/* Profil utilisateur */}
        <Card
          title="Profil utilisateur"
          icon="person"
          onPress={() => router.push('/tabs/profile')}
          customColor={C.brand} // teal
        />
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
              <Button size="md" leftIcon="add-circle">
                Créer un restaurant
              </Button>
              <IconButton icon="add" />
            </ButtonGroup>
          )}
        </View>
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

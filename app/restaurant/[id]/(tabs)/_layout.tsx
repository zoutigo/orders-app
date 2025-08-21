// app/restaurant/[id]/(tabs)/_layout.tsx
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function RestaurantTabsLayout() {
  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarActiveTintColor: '#e74c3c',
        tabBarIndicatorStyle: { backgroundColor: '#e74c3c' },
        tabBarStyle: { backgroundColor: '#fff' },
      }}
    >
      <MaterialTopTabs.Screen name="server" options={{ title: 'Serveur' }} />
      <MaterialTopTabs.Screen name="kitchen" options={{ title: 'Cuisine' }} />
      <MaterialTopTabs.Screen name="cashier" options={{ title: 'Caisse' }} />
      <MaterialTopTabs.Screen name="stats" options={{ title: 'Stats' }} />
    </MaterialTopTabs>
  );
}

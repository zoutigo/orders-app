// app/restaurant/[id]/(tabs)/operations/waiter/_layout.tsx
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function CashierTabsLayout() {
  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarActiveTintColor: '#e74c3c',
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
        tabBarIndicatorStyle: { backgroundColor: '#e74c3c' },
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'A payer',
          // tabBarIcon: ({ color }) => <Ionicons name="restaurant-outline" size={18} color={color} />,
        }}
      />
      <MaterialTopTabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          // tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={18} color={color} />,
        }}
      />
      <MaterialTopTabs.Screen
        name="actions"
        options={{
          title: 'Actions',
          // tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={18} color={color} />,
        }}
      />
    </MaterialTopTabs>
  );
}

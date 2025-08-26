// app/(tabs)/operations/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

export default function OperationsTopTabsLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        drawerActiveTintColor: '#e74c3c',
      }}
    >
      <Drawer.Screen
        name="cuisine"
        options={{
          title: 'Cuisine',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="caisse"
        options={{
          title: 'Caisse',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="service"
        options={{
          title: 'Service',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="supervision"
        options={{
          title: 'Supervision',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

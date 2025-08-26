// app/(tabs)/home/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function HomeDrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        drawerActiveTintColor: '#e74c3c',
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Vue Globale',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

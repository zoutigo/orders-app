import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import type { DrawerNavigationOptions } from '@react-navigation/drawer';

export default function RestaurantLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        drawerActiveTintColor: '#e74c3c',
      }}
    >
      <Drawer.Screen
        name="(tabs)" // ton sous-layout top tabs
        options={{
          title: 'Vue Globale',
          drawerIcon: ({
            color,
            size,
          }: Parameters<NonNullable<DrawerNavigationOptions['drawerIcon']>>[0]) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="menus"
        options={{
          title: 'Menus',
          drawerIcon: ({
            color,
            size,
          }: Parameters<NonNullable<DrawerNavigationOptions['drawerIcon']>>[0]) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="roles"
        options={{
          title: 'Rôles',
          drawerIcon: ({
            color,
            size,
          }: Parameters<NonNullable<DrawerNavigationOptions['drawerIcon']>>[0]) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="tables"
        options={{
          title: 'Tables',
          drawerIcon: ({
            color,
            size,
          }: Parameters<NonNullable<DrawerNavigationOptions['drawerIcon']>>[0]) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

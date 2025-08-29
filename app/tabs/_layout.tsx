// app/(app)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme.web';

export default function AppTabsLayout() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.tabIconDefault,
        tabBarStyle: { backgroundColor: C.card },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      /> */}
      {/* <Tabs.Screen
        name="help/index"
        options={{
          title: 'Aide',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        // si ta page racine d’aide est app/(app)/(tabs)/help/index.tsx
        name="help/index"
        options={{
          title: 'Aide',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-buoy-outline" size={size} color={color} />
          ),
          // permet aussi d’ouvrir /tabs/help via push('/tabs/help')
          href: '/tabs/help',
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
          href: '/tabs/profile',
        }}
      />
      <Tabs.Screen
        // racine des restaurants dans le groupe tabs : restaurants/index.tsx
        name="restaurants/index"
        options={{
          title: 'Restaurants',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
          href: '/tabs/restaurants',
        }}
      />
    </Tabs>
  );
}

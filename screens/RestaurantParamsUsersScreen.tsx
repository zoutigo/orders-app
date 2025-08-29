// app/restaurant/[id]/(tabs)/params/users.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '@/hooks/useAppStore';
import Colors from '@/constants/Colors';
import { spacing, radius, typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

import Button from '@/components/ui/Button';
import ButtonGroup from '@/components/ui/ButtonGroup';
import ConfirmModal from '@/components/modals/ConfirmModal';

// Typage User (selon ton store) + champs optionnels utiles ici
type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role?: string;
  restaurantId?: string;
};

export default function RestaurantParamsUsersScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const usersAll = useAppStore((s) => s.users as User[]);

  // Filtrage par restaurant si pertinent
  const users = useMemo(() => {
    if (!currentRestaurantId) return usersAll;
    const someHaveRestaurant = usersAll.some((u) => u.restaurantId);
    return someHaveRestaurant
      ? usersAll.filter((u) => u.restaurantId === currentRestaurantId)
      : usersAll;
  }, [usersAll, currentRestaurantId]);

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [excludeModalUser, setExcludeModalUser] = useState<User | null>(null);

  const toggleExpand = useCallback(
    (id: string) => setExpandedId((cur) => (cur === id ? null : id)),
    [],
  );

  const rolePillColor = (role?: string) => {
    if (!role) return { bg: C.neutral100, text: C.text, border: C.border };
    const r = role.toLowerCase();
    if (r.includes('admin')) return { bg: C.brand, text: C.neutral0, border: C.brand };
    if (r.includes('serve')) return { bg: C.accent, text: C.neutral0, border: C.accent };
    if (r.includes('prep')) return { bg: C.success, text: C.neutral0, border: C.success };
    return { bg: C.neutral100, text: C.text, border: C.border };
    // adapte si tu as une liste stricte des rôles
  };

  const renderItem = ({ item }: { item: User }) => {
    const isOpen = expandedId === item.id;
    const role = item.role ?? '—';
    const pill = rolePillColor(item.role);

    return (
      <View
        style={{
          backgroundColor: C.card,
          borderColor: C.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          padding: spacing(1.5),
          marginBottom: spacing(1.25),
          // petit accent à gauche
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: isOpen ? 54 + spacing(1.25) : 0, // laisse la place pour le button group quand ouvert
            width: 4,
            backgroundColor: C.brand,
            opacity: 0.85,
            borderTopLeftRadius: radius.lg,
            borderBottomLeftRadius: radius.lg,
          }}
        />
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.75}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: C.surface,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing(1.25),
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Ionicons name="person-outline" size={20} color={C.brand} />
          </View>

          {/* Infos */}
          <View style={{ flex: 1 }}>
            <Text style={[typography.defaultSemiBold, { color: C.text }]}>
              {item.firstname} {item.lastname}
            </Text>
            <Text style={{ color: C.muted, fontSize: 13 }}>{item.email}</Text>
          </View>

          {/* Rôle (pill) */}
          <View
            style={{
              paddingHorizontal: spacing(1),
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: pill.bg,
              borderWidth: 1,
              borderColor: pill.border,
              marginLeft: spacing(1),
            }}
          >
            <Text style={{ color: pill.text, fontSize: 12 }}>{role}</Text>
          </View>

          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={C.muted}
            style={{ marginLeft: spacing(0.5) }}
          />
        </TouchableOpacity>

        {/* Actions */}
        {isOpen && (
          <View style={{ marginTop: spacing(1.25) }}>
            <ButtonGroup segmented fullWidth gap={1}>
              <Button
                variant="outline"
                size="md"
                fullWidth
                leftIcon="shield-checkmark-outline"
                onPress={() => setRoleModalUser(item)}
              >
                Role
              </Button>
              <Button
                variant="danger"
                size="md"
                fullWidth
                leftIcon="person-remove-outline"
                onPress={() => setExcludeModalUser(item)}
              >
                Exclure
              </Button>
            </ButtonGroup>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: spacing(2), backgroundColor: C.background }}>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing(4) }}
        ListEmptyComponent={
          <View style={{ padding: spacing(2) }}>
            <Text style={{ color: C.muted }}>Aucun utilisateur pour ce restaurant.</Text>
          </View>
        }
      />

      {/* Modale Changer le rôle */}
      <ConfirmModal
        visible={!!roleModalUser}
        title="Changer le rôle"
        message={
          roleModalUser
            ? `Changer le rôle de ${roleModalUser.firstname} ${roleModalUser.lastname} ?`
            : ''
        }
        confirmText="Confirmer"
        cancelText="Annuler"
        onCancel={() => setRoleModalUser(null)}
        onConfirm={() => setRoleModalUser(null)} // pour l’instant, noop
      />

      {/* Modale Exclure */}
      <ConfirmModal
        visible={!!excludeModalUser}
        title="Exclure du restaurant"
        message={
          excludeModalUser
            ? `Exclure ${excludeModalUser.firstname} ${excludeModalUser.lastname} du restaurant ?`
            : ''
        }
        confirmText="Exclure"
        cancelText="Annuler"
        onCancel={() => setExcludeModalUser(null)}
        onConfirm={() => setExcludeModalUser(null)} // pour l’instant, noop
      />
    </View>
  );
}

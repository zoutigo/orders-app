// app/restaurant/[id]/(tabs)/params/users.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '@/hooks/useAppStore';
import Colors from '@/constants/Colors';
import { spacing, radius, typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

import Button from '@/components/ui/Button';
import ButtonGroup from '@/components/ui/ButtonGroup';
import ConfirmModal from '@/components/modals/ConfirmModal';
import { ThemedText } from '@/components/ThemedText';

import type { Role } from '@/hooks/useAppStore';

export default function RestaurantParamsUsersScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const usersAll = useAppStore((s) => s.users);
  const memberships = useAppStore((s) => s.memberships);
  const approveMembership = useAppStore((s) => s.approveMembership);
  const revokeMembership = useAppStore((s) => s.revokeMembership);

  const usersById = useMemo(() => Object.fromEntries(usersAll.map((u) => [u.id, u])), [usersAll]);

  const members = useMemo(() => {
    if (!currentRestaurantId) return [] as any[];
    return memberships
      .filter((m) => m.restaurantId === currentRestaurantId && m.status === 'accepted')
      .map((m) => ({ ...m, user: usersById[m.userId] }))
      .sort((a, b) => a.user?.firstname?.localeCompare(b.user?.firstname || '') || 0);
  }, [memberships, currentRestaurantId, usersById]);

  const pending = useMemo(() => {
    if (!currentRestaurantId) return [] as any[];
    return memberships
      .filter((m) => m.restaurantId === currentRestaurantId && m.status === 'pending')
      .map((m) => ({ ...m, user: usersById[m.userId] }));
  }, [memberships, currentRestaurantId, usersById]);

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [roleModalMemberId, setRoleModalMemberId] = useState<string | null>(null);
  const [excludeModalMemberId, setExcludeModalMemberId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('waiter');

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

  const renderItem = ({ item }: { item: any }) => {
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
        {/* <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing(1.25) }}>
          <View style={styles.heroIcon}>
            <Ionicons name="pricetag-outline" size={22} color={C.neutral0} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={{ color: C.neutral0, fontSize: 18 }}>
              Produits
            </ThemedText>
            <ThemedText style={{ color: 'rgba(255,255,255,0.95)' }}>
              {users.length} utilisateurs(s) configuré(s)
            </ThemedText>
          </View>
        </View> */}
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
              {item.user?.firstname} {item.user?.lastname}
            </Text>
            <Text style={{ color: C.muted, fontSize: 13 }}>{item.user?.email}</Text>
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
                onPress={() => {
                  setRoleModalMemberId(item.id);
                  setSelectedRole(item.role || 'waiter');
                }}
              >
                Role
              </Button>
              <Button
                variant="danger"
                size="md"
                fullWidth
                leftIcon="person-remove-outline"
                onPress={() => setExcludeModalMemberId(item.id)}
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
      {/* Pending requests */}
      {pending.length > 0 && (
        <View style={{ marginBottom: spacing(1.25) }}>
          <ThemedText type="defaultSemiBold">Demandes en attente</ThemedText>
        </View>
      )}
      <FlatList
        data={pending}
        keyExtractor={(u) => u.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing(4) }}
      />

      <View style={{ height: spacing(1.5) }} />

      <ThemedText type="defaultSemiBold" style={{ marginBottom: spacing(1) }}>
        Membres
      </ThemedText>
      <FlatList
        data={members}
        keyExtractor={(u) => u.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing(4) }}
        ListEmptyComponent={
          <View style={{ padding: spacing(2) }}>
            <Text style={{ color: C.muted }}>Aucun membre.</Text>
          </View>
        }
      />

      {/* Modale Changer le rôle */}
      {roleModalMemberId && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: C.card,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            borderWidth: 1,
            borderColor: C.border,
            padding: spacing(1.5),
          }}
        >
          <ThemedText type="defaultSemiBold" style={{ marginBottom: spacing(1) }}>
            Choisir un rôle
          </ThemedText>
          <ButtonGroup segmented fullWidth gap={1}>
            {(['waiter', 'preparator', 'cashier', 'supervisor', 'owner'] as Role[]).map((r) => (
              <Button
                key={r}
                variant={selectedRole === r ? 'primary' : 'outline'}
                onPress={() => setSelectedRole(r)}
                fullWidth
              >
                {r}
              </Button>
            ))}
          </ButtonGroup>
          <View style={{ flexDirection: 'row', gap: spacing(1), marginTop: spacing(1) }}>
            <Button fullWidth variant="outline" onPress={() => setRoleModalMemberId(null)}>
              Annuler
            </Button>
            <Button
              fullWidth
              onPress={() => {
                if (currentUserId && roleModalMemberId) {
                  approveMembership(roleModalMemberId, selectedRole, currentUserId);
                }
                setRoleModalMemberId(null);
              }}
            >
              Confirmer
            </Button>
          </View>
        </View>
      )}

      {/* Modale Exclure */}
      <ConfirmModal
        visible={!!excludeModalMemberId}
        title="Exclure du restaurant"
        message="Confirmez l’exclusion de ce membre."
        confirmText="Exclure"
        cancelText="Annuler"
        onCancel={() => setExcludeModalMemberId(null)}
        onConfirm={() => {
          if (excludeModalMemberId) revokeMembership(excludeModalMemberId);
          setExcludeModalMemberId(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});

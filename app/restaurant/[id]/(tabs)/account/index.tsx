import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/ui/Button';
import { useAppStore } from '@/hooks/useAppStore';
import ConfirmModal from '@/components/modals/ConfirmModal';
import Toolbar from '@/components/ui/Toolbar';
import ToolbarSpacer from '@/components/ui/ToolbarSpacer';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedInputBase } from '@/components/ui/ThemedInputText';
import { Zeroconf } from '@/services/sync/Zeroconf';

export default function RestaurantDisconnect() {
  const logout = useAppStore((s) => s.logout);
  const setCurrentRestaurant = useAppStore((s) => s.setCurrentRestaurant);
  const user = useAppStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const currentRestaurantId = useAppStore((s) => s.currentRestaurantId);
  const getUserRoleForRestaurant = useAppStore((s) => s.getUserRoleForRestaurant as any);

  const deviceId = useAppStore((s) => s.deviceId);
  const masterDeviceId = useAppStore((s) => s.masterDeviceId);
  const socketStatus = useAppStore((s) => s.socketStatus as any);
  const serverHost = useAppStore((s) => s.serverHost);
  const serverPort = useAppStore((s) => s.serverPort);
  const setServerAddress = useAppStore((s) => s.setServerAddress);
  const startAsMaster = useAppStore((s) => s.startAsMaster);
  const connectToMaster = useAppStore((s) => s.connectToMaster);
  const connectedDevices = useAppStore((s) => s.connectedDevices);
  const deviceNames = useAppStore((s) => s.connectedDeviceNames);
  const setMasterDevice = useAppStore((s) => s.setMasterDevice);

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [hostInput, setHostInput] = useState(serverHost ?? '');
  const [portInput, setPortInput] = useState(String(serverPort ?? 5555));

  const handleRestaurantDisconnect = () => {
    setCurrentRestaurant(undefined);
    router.replace('/tabs');
  };

  const handleFullDisconnect = () => {
    setCurrentRestaurant(undefined);
    logout();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <Toolbar title="Mon compte" subtitle={user?.email ?? ''} centerTitle sticky />
      <ToolbarSpacer />
      <View style={{ padding: spacing(2) }}>
        {/* --------- User Card --------- */}
        <View
          style={{
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: radius.lg,
            padding: spacing(2),
            marginBottom: spacing(2),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: scheme === 'light' ? C.neutral100 : C.neutral50,
                marginRight: spacing(1.5),
              }}
            >
              <Ionicons name="person-outline" size={28} color={C.brand} />
            </View>

            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle">
                {user ? `${user.firstname} ${user.lastname}` : 'Utilisateur inconnu'}
              </ThemedText>
              <ThemedText style={{ color: C.muted }}>{user?.email ?? '—'}</ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* --------- Sync / Socket --------- */}
      <View style={{ padding: spacing(2), paddingTop: 0 }}>
        <View
          style={{
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: radius.lg,
            padding: spacing(1.5),
            marginBottom: spacing(2),
            gap: spacing(1),
          }}
        >
          <ThemedText type="defaultSemiBold">Synchronisation locale</ThemedText>
          <ThemedText style={{ color: C.muted }}>
            Statut: {socketStatus} • Appareil: {deviceId}
          </ThemedText>
          <ThemedText style={{ color: C.muted }}>
            Maître: {masterDeviceId ? masterDeviceId : 'non défini'}
          </ThemedText>

          <View style={{ height: spacing(1) }} />

          <ThemedInputBase
            label="Adresse IP du maître"
            value={hostInput}
            onChangeText={(t) => setHostInput(t)}
            placeholder="ex: 192.168.1.10"
            autoCapitalize="none"
            icon="wifi-outline"
          />
          <ThemedInputBase
            label="Port"
            value={portInput}
            onChangeText={(t) => setPortInput(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            placeholder="5555"
            icon="git-network-outline"
          />

          <View style={{ flexDirection: 'row', gap: spacing(1) }}>
            <Button
              fullWidth
              size="md"
              variant="outline"
              leftIcon="radio-button-on-outline"
              onPress={async () => {
                const p = parseInt(portInput || '5555', 10) || 5555;
                setServerAddress(hostInput || '', p);
                await connectToMaster();
              }}
            >
              Se connecter au maître
            </Button>
            <Button
              fullWidth
              size="md"
              leftIcon="server-outline"
              onPress={async () => {
                await startAsMaster();
              }}
            >
              Démarrer comme maître
            </Button>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing(1) }}>
            <Button
              fullWidth
              size="md"
              variant="ghost"
              leftIcon="search-outline"
              onPress={() => {
                Zeroconf.startBrowsing((svc) => {
                  const addr = svc.addresses?.[0] || svc.host;
                  if (addr && svc.port) {
                    setHostInput(addr);
                    setPortInput(String(svc.port));
                    setServerAddress(addr, svc.port);
                  }
                });
              }}
            >
              Découvrir le maître (mDNS)
            </Button>
          </View>

          {currentRestaurantId && user ? (
            <ThemedText style={{ color: C.muted }}>
              Rôle: {getUserRoleForRestaurant(user.id, currentRestaurantId) ?? '—'}
            </ThemedText>
          ) : null}

          {/* Connected devices (maître visibility or all) */}
          {connectedDevices.length > 0 && (
            <View style={{ marginTop: spacing(1) }}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 4 }}>
                Appareils connectés
              </ThemedText>
              {connectedDevices.map((id) => (
                <View
                  key={id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 6,
                  }}
                >
                  <ThemedText style={{ color: id === deviceId ? C.brand : C.text }}>
                    {deviceNames?.[id] || `Device-${id.slice(-4)}`} • {id === deviceId ? 'moi' : id}
                  </ThemedText>
                  <Button
                    size="sm"
                    variant={masterDeviceId === id ? 'primary' : 'outline'}
                    onPress={() => setMasterDevice(id)}
                  >
                    {masterDeviceId === id ? 'Maître' : 'Définir maître'}
                  </Button>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* --------- Actions --------- */}
      <View style={{ gap: spacing(1), paddingHorizontal: spacing(2) }}>
        {/* Brand teal (action non destructive) */}
        <Button
          fullWidth
          size="lg"
          leftIcon="storefront-outline"
          onPress={() => setConfirmLeave(true)}
          variant="ghost"
          style={{ borderWidth: 1, borderColor: C.brand }}
        >
          Quitter ce restaurant
        </Button>

        {/* Accent orange pour action primaire neutre */}
        <Button
          fullWidth
          size="md"
          variant="outline"
          leftIcon="person-circle-outline"
          onPress={() => router.push('/tabs/profile')}
        >
          Voir mon profil
        </Button>

        {/* Destructive */}
        <Button
          fullWidth
          variant="danger"
          size="lg"
          leftIcon="log-out-outline"
          onPress={() => setConfirmLogout(true)}
        >
          Déconnexion complète
        </Button>
      </View>

      {/* Confirmation de déconnexion destructrice */}
      <ConfirmModal
        visible={confirmLogout}
        title="Confirmer la déconnexion"
        message="Vous allez vous déconnecter de l’application et de ce restaurant. Continuer ?"
        cancelText="Annuler"
        confirmText="Se déconnecter"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          handleFullDisconnect();
        }}
      />

      <ConfirmModal
        visible={confirmLeave}
        title="Quitter ce restaurant ?"
        message="Vous retournerez à la liste des restaurants, sans vous déconnecter de l’application."
        cancelText="Annuler"
        confirmText="Quitter"
        onCancel={() => setConfirmLeave(false)}
        onConfirm={() => {
          setConfirmLeave(false);
          handleRestaurantDisconnect();
        }}
      />
    </View>
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
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
import Toast from 'react-native-toast-message';
import { Zeroconf, Service as ZcService } from '@/services/sync/Zeroconf';
import { SyncManager } from '@/services/sync/SyncManager';

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
  const stopMaster = useAppStore((s) => s.stopMaster);
  const connectToMaster = useAppStore((s) => s.connectToMaster);
  const connectedDevices = useAppStore((s) => s.connectedDevices);
  const deviceNames = useAppStore((s) => s.connectedDeviceNames);
  const setMasterDevice = useAppStore((s) => s.setMasterDevice);

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  // Découverte mDNS
  const [services, setServices] = useState<ZcService[]>([]);
  const [scanning, setScanning] = useState(false);
  const lastConnectedRef = useRef<string | undefined>(undefined);

  const handleRestaurantDisconnect = () => {
    setCurrentRestaurant(undefined);
    router.replace('/tabs');
  };

  const handleFullDisconnect = () => {
    setCurrentRestaurant(undefined);
    logout();
    router.replace('/login');
  };

  // Toaster when status changes
  useEffect(() => {
    if (socketStatus === 'connected' && lastConnectedRef.current !== 'connected') {
      Toast.show({
        type: 'success',
        text1: masterDeviceId === deviceId ? 'Appareil maître démarré ✅' : 'Connecté au maître ✅',
      });
    }
    if (socketStatus === 'error' && lastConnectedRef.current !== 'error') {
      Toast.show({ type: 'error', text1: 'Connexion échouée ❌' });
    }
    lastConnectedRef.current = socketStatus as any;
  }, [socketStatus, masterDeviceId, deviceId]);

  const doScan = async () => {
    setScanning(true);
    try {
      let found = await Zeroconf.browseOnce(3500);
      if (!found || found.length === 0) {
        const alt = await Zeroconf.fallbackScanTCP(serverPort || 5555);
        found = alt;
      }
      setServices(found);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    // Scan au montage
    doScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMaster = masterDeviceId && masterDeviceId === deviceId && socketStatus === 'connected';
  const ConnectedIcon = (
    <Ionicons
      name={
        socketStatus === 'connected'
          ? 'wifi'
          : socketStatus === 'connecting'
            ? 'wifi-outline'
            : 'wifi'
      }
      size={16}
      color={socketStatus === 'connected' ? C.success : C.muted}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <Toolbar title="Mon compte" subtitle={user?.email ?? ''} centerTitle sticky />
      <ToolbarSpacer />
      <ScrollView contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(3) }}>
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
      </ScrollView>

      {/* --------- Sync / Socket --------- */}
      <ScrollView contentContainerStyle={{ padding: spacing(2), paddingTop: 0 }}>
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
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <ThemedText type="defaultSemiBold">Synchronisation locale</ThemedText>
            {ConnectedIcon}
          </View>
          <ThemedText style={{ color: C.muted }}>Statut: {socketStatus}</ThemedText>
          <ThemedText style={{ color: C.muted }}>Appareil: {deviceId}</ThemedText>
          <ThemedText style={{ color: C.muted }}>
            Maître: {masterDeviceId ? masterDeviceId : 'non défini'}
          </ThemedText>

          <View style={{ height: spacing(1) }} />
          {/* Parcours mDNS et connexion sans saisie manuelle */}
          <View style={{ flexDirection: 'column', gap: spacing(1), alignItems: 'stretch' }}>
            <Button
              fullWidth
              size="md"
              leftIcon="qr-code-outline"
              onPress={() => router.push('./qr-scan')}
            >
              Scanner le QR du maître
            </Button>
            <Button
              fullWidth
              size="md"
              leftIcon={scanning ? 'sync' : 'search-outline'}
              onPress={doScan}
              disabled={scanning}
            >
              {scanning ? 'Recherche…' : 'Actualiser la liste'}
            </Button>
            <Button
              fullWidth
              size="md"
              leftIcon={isMaster ? 'stop-circle-outline' : 'server-outline'}
              variant={isMaster ? 'danger' : 'primary'}
              onPress={async () => {
                if (isMaster) {
                  await stopMaster();
                  Toast.show({ type: 'success', text1: 'Maître arrêté ✅' });
                } else {
                  await startAsMaster();
                  Toast.show({ type: 'success', text1: 'Appareil mis en maître ✅' });
                }
                setTimeout(() => doScan(), 600);
              }}
            >
              {isMaster ? 'Arrêter le maître' : 'Démarrer comme maître'}
            </Button>
            {isMaster && (
              <Button
                fullWidth
                size="md"
                variant="outline"
                leftIcon="qr-code-outline"
                onPress={() => router.push('./qr-master')}
              >
                Afficher le QR maître
              </Button>
            )}
          </View>

          {/* Liste des maîtres découverts */}
          {isMaster ? (
            <ThemedText style={{ color: C.muted }}>
              Vous êtes le maître et annoncez le service sur le réseau.
            </ThemedText>
          ) : services.length > 0 ? (
            <View style={{ marginTop: spacing(1) }}>
              {services.map((svc, idx) => {
                const addr = svc.addresses?.[0] || svc.host || '—';
                const isCurrent = addr && addr === serverHost && socketStatus === 'connected';
                const isMasterSvc = (svc.name || '').startsWith('orders-master-');
                return (
                  <Pressable
                    key={`${addr}:${svc.port}:${idx}`}
                    android_ripple={{ color: C.ripple }}
                    onPress={async () => {
                      if (!addr || !svc.port) return;
                      setServerAddress(addr, svc.port);
                      await connectToMaster();
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: isCurrent ? C.success : C.border,
                      borderRadius: radius.md,
                      padding: spacing(1),
                      marginBottom: spacing(1),
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: C.card,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText type="defaultSemiBold">{svc.name || 'Maître détecté'}</ThemedText>
                      <ThemedText style={{ color: C.muted }}>
                        {addr}:{svc.port}
                      </ThemedText>
                    </View>
                    {isMasterSvc && (
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 999,
                          backgroundColor: C.surface,
                          borderWidth: 1,
                          borderColor: isCurrent ? C.success : C.border,
                          marginRight: spacing(1),
                        }}
                      >
                        <ThemedText
                          type="caption"
                          style={{ color: isCurrent ? C.success : C.muted }}
                        >
                          maître
                        </ThemedText>
                      </View>
                    )}
                    <Ionicons
                      name={isCurrent ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isCurrent ? C.success : C.muted}
                    />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <ThemedText style={{ color: C.muted }}>Aucun maître détecté pour le moment.</ThemedText>
          )}

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
                    onPress={() => {
                      if (id === deviceId) return;
                      if (isMaster) {
                        // Demander explicitement à cet appareil de devenir maître
                        SyncManager.sendControl('BECOME_MASTER', {
                          to: id,
                          from: deviceId,
                          port: serverPort,
                        });
                        Toast.show({ type: 'success', text1: 'Demande de délégation envoyée' });
                      } else {
                        setMasterDevice(id);
                      }
                    }}
                  >
                    {masterDeviceId === id ? 'Maître' : 'Définir maître'}
                  </Button>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* --------- Actions --------- */}
      <View style={{ gap: spacing(1), paddingHorizontal: spacing(2), paddingBottom: spacing(2) }}>
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

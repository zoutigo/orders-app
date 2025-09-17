import React, { useMemo } from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import Toolbar from '@/components/ui/Toolbar';
import ToolbarSpacer from '@/components/ui/ToolbarSpacer';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/hooks/useAppStore';
import * as Pair from '@/services/sync/Pairing';
import Constants from 'expo-constants';
import { router } from 'expo-router';

export default function QrMasterScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const deviceId = useAppStore((s) => s.deviceId);
  const serverPort = useAppStore((s) => s.serverPort);

  const [addrs, setAddrs] = React.useState<string[]>([]);
  React.useEffect(() => {
    (async () => setAddrs(await Pair.getLocalAddresses()))();
  }, []);

  const deviceName = (Constants?.deviceName as any) || `Device-${deviceId.slice(-4)}`;
  const payload = useMemo<Pair.PairingPayload>(
    () =>
      Pair.buildPayload({
        v: 1,
        t: 'orders-master',
        id: deviceId,
        name: deviceName,
        port: serverPort,
        addrs,
      }),
    [deviceId, deviceName, serverPort, addrs],
  );

  const uri = useMemo(() => Pair.toURI(payload), [payload]);

  // Try to render QR if lib exists
  let QRComp: any = null;
  try {
    const QR = require('react-native-qrcode-svg');
    QRComp = QR?.default || QR;
  } catch {}

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <Toolbar title="QR du maître" centerTitle sticky />
      <ToolbarSpacer />
      <View style={{ padding: spacing(2), gap: spacing(2) }}>
        <View style={{ alignItems: 'center', gap: spacing(1) }}>
          {QRComp ? (
            <QRComp
              value={JSON.stringify(payload)}
              size={260}
              backgroundColor={C.background}
              color={scheme === 'light' ? '#000' : '#fff'}
            />
          ) : (
            <View
              style={{
                padding: spacing(2),
                borderWidth: 1,
                borderColor: C.border,
                borderRadius: radius.lg,
              }}
            >
              <ThemedText>Installez react-native-qrcode-svg pour afficher le QR</ThemedText>
            </View>
          )}
          <ThemedText style={{ color: C.muted, textAlign: 'center' }}>
            {deviceName} • {deviceId}
          </ThemedText>
          <ThemedText style={{ color: C.muted, textAlign: 'center' }}>
            {addrs[0] ? `${addrs[0]}:${serverPort}` : `port ${serverPort}`}
          </ThemedText>
        </View>

        <View
          style={{
            padding: spacing(1.5),
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: radius.lg,
          }}
        >
          <ThemedText type="defaultSemiBold">Lien rapide</ThemedText>
          <ThemedText style={{ color: C.muted }}>{uri}</ThemedText>
        </View>

        <Button fullWidth onPress={() => router.back()} leftIcon="arrow-back-outline">
          Retour
        </Button>
      </View>
    </View>
  );
}

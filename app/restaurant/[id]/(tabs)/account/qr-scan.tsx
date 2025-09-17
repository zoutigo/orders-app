import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import Toolbar from '@/components/ui/Toolbar';
import ToolbarSpacer from '@/components/ui/ToolbarSpacer';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { spacing, radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/hooks/useAppStore';
import Toast from 'react-native-toast-message';
import * as Pair from '@/services/sync/Pairing';
import { router } from 'expo-router';

export default function QrScanScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const setServerAddress = useAppStore((s) => s.setServerAddress);
  const connectToMaster = useAppStore((s) => s.connectToMaster);

  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
  const [scanned, setScanned] = React.useState(false);

  let ScannerView: any = null;
  let requestPermission: any = null;
  try {
    const Bar = require('expo-barcode-scanner');
    ScannerView = Bar.BarcodeScanner;
    requestPermission = Bar.BarcodeScanner.requestPermissionsAsync;
  } catch {}

  React.useEffect(() => {
    (async () => {
      if (requestPermission) {
        const { status } = await requestPermission();
        setHasPermission(status === 'granted');
      } else {
        setHasPermission(false);
      }
    })();
  }, []);

  const onScanned = async (data: string) => {
    if (scanned) return;
    setScanned(true);
    try {
      const parsed = Pair.parseInput(data);
      if (!parsed) throw new Error('QR invalide');
      const candidates =
        parsed.addrs && parsed.addrs.length
          ? parsed.addrs
          : ([parsed.host].filter(Boolean) as string[]);
      const port = parsed.port || 5555;
      let ok = false;
      for (const host of candidates) {
        if (!host) continue;
        setServerAddress(host, port);
        try {
          await connectToMaster();
          ok = true;
          break;
        } catch {}
      }
      if (ok) {
        Toast.show({ type: 'success', text1: 'Connecté au maître ✅' });
        setTimeout(() => router.back(), 250);
      } else {
        throw new Error('Connexion impossible');
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Scan échoué', text2: e?.message || '' });
      setScanned(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <Toolbar title="Scanner le QR" centerTitle sticky />
      <ToolbarSpacer />
      <View style={{ flex: 1 }}>
        {ScannerView && hasPermission ? (
          <ScannerView
            onBarCodeScanned={({ data }: any) => onScanned(String(data))}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={{ padding: spacing(2), gap: spacing(1) }}>
            <ThemedText type="defaultSemiBold">Permission caméra requise</ThemedText>
            <ThemedText style={{ color: C.muted }}>
              Installez expo-barcode-scanner et autorisez la caméra pour scanner le QR du maître.
            </ThemedText>
            <View
              style={{
                padding: spacing(1.5),
                borderWidth: 1,
                borderColor: C.border,
                borderRadius: radius.lg,
              }}
            >
              <ThemedText type="defaultSemiBold">Alternative</ThemedText>
              <ThemedText style={{ color: C.muted }}>
                Demandez au maître de partager aussi l’URI; vous pouvez le copier/coller ici.
              </ThemedText>
            </View>
            <Button fullWidth onPress={() => router.back()} leftIcon="arrow-back-outline">
              Retour
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

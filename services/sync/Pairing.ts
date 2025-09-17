// services/sync/Pairing.ts
// Helper for building and parsing pairing payloads (QR / URI) for local sync.

export type PairingPayload = {
  v: 1;
  t: 'orders-master';
  id: string; // device id
  name?: string; // device name
  port: number;
  addrs?: string[]; // candidate addresses
};

export const buildPayload = (p: PairingPayload) => p;

export const toURI = (p: PairingPayload) => {
  // ordersapp://pair?host=...&port=...&id=...&name=... (host from addrs[0] if present)
  const host = p.addrs?.[0] ?? '';
  const usp = new URLSearchParams();
  if (host) usp.set('host', host);
  usp.set('port', String(p.port));
  usp.set('id', p.id);
  if (p.name) usp.set('name', p.name);
  return `ordersapp://pair?${usp.toString()}`;
};

export type ParsedPairing = {
  host?: string;
  port?: number;
  id?: string;
  name?: string;
  addrs?: string[];
};

export const parseInput = (raw: string): ParsedPairing | null => {
  try {
    // Try JSON first
    const j = JSON.parse(raw);
    if (j && j.v === 1 && j.t === 'orders-master') {
      return {
        host: j.addrs?.[0],
        port: Number(j.port) || undefined,
        id: j.id,
        name: j.name,
        addrs: Array.isArray(j.addrs) ? j.addrs : undefined,
      };
    }
  } catch {}
  try {
    // Try URI form
    const u = new URL(raw);
    if (u.protocol.startsWith('ordersapp')) {
      const host = u.searchParams.get('host') || undefined;
      const port = Number(u.searchParams.get('port') || '') || undefined;
      const id = u.searchParams.get('id') || undefined;
      const name = u.searchParams.get('name') || undefined;
      return { host, port, id, name };
    }
  } catch {}
  return null;
};

export async function getLocalAddresses(): Promise<string[]> {
  try {
    const Network = require('expo-network');
    const ip = await Network.getIpAddressAsync?.();
    const arr: string[] = [];
    if (ip) arr.push(ip);
    // Common Android hotspot gateway
    if (!arr.includes('192.168.43.1')) arr.push('192.168.43.1');
    return arr;
  } catch {
    return ['192.168.43.1'];
  }
}

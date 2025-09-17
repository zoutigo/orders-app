// services/sync/Zeroconf.ts
// Optional mDNS discovery/advertising using react-native-zeroconf.
// No-ops gracefully if the module is not available (Expo managed w/o plugin).

export type Service = {
  name: string;
  host?: string;
  addresses?: string[];
  port?: number;
};

class _ZeroconfWrapper {
  private zcBrowser: any | null = null;
  private zcAdvertiser: any | null = null;
  private browsing = false;
  private advertising = false;

  private ensureBrowser() {
    if (this.zcBrowser) return;
    try {
      const Zeroconf = require('react-native-zeroconf');
      this.zcBrowser = new Zeroconf();
    } catch {
      this.zcBrowser = null;
    }
  }

  private ensureAdvertiser() {
    if (this.zcAdvertiser) return;
    try {
      const Zeroconf = require('react-native-zeroconf');
      this.zcAdvertiser = new Zeroconf();
    } catch {
      this.zcAdvertiser = null;
    }
  }

  startAdvertising(serviceName: string, port: number, type = 'ordersapp', domain = 'local.') {
    this.ensureAdvertiser();
    if (!this.zcAdvertiser || this.advertising) return;
    try {
      this.zcAdvertiser.publishService(type, 'tcp', domain, serviceName, port, {});
      this.advertising = true;
    } catch {}
  }

  stopAdvertising() {
    if (!this.zcAdvertiser) return;
    try {
      this.zcAdvertiser.stop();
    } catch {}
    this.advertising = false;
  }

  startBrowsing(onService: (svc: Service) => void, type = 'ordersapp', domain = 'local.') {
    this.ensureBrowser();
    if (!this.zcBrowser || this.browsing) return;
    try {
      this.zcBrowser.on('resolved', (service: any) => {
        onService({
          name: service?.name,
          host: service?.host,
          addresses: service?.addresses,
          port: service?.port,
        });
      });
      this.zcBrowser.scan(type, 'tcp', domain);
      this.browsing = true;
    } catch {}
  }

  stopBrowsing() {
    if (!this.zcBrowser) return;
    try {
      this.zcBrowser.stop();
    } catch {}
    this.browsing = false;
  }

  /**
   * Browse once for a short time and return discovered services.
   * Convenience wrapper for UI that needs a refresh button.
   */
  async browseOnce(timeoutMs = 3000, type = 'ordersapp', domain = 'local.'): Promise<Service[]> {
    // Use a dedicated instance so we don't stop advertising
    let tmp: any = null;
    try {
      const Zeroconf = require('react-native-zeroconf');
      tmp = new Zeroconf();
    } catch {
      return [];
    }
    const results: Record<string, Service> = {};
    return await new Promise<Service[]>((resolve) => {
      let resolvedHandler: any;
      try {
        resolvedHandler = (service: any) => {
          const svc: Service = {
            name: service?.name,
            host: service?.host,
            addresses: service?.addresses,
            port: service?.port,
          };
          const key = `${svc.host || svc.addresses?.[0] || svc.name}:${svc.port || ''}`;
          results[key] = svc;
        };
        tmp.on('resolved', resolvedHandler);
        tmp.scan(type, 'tcp', domain);
      } catch {
        resolve([]);
        return;
      }
      setTimeout(
        () => {
          try {
            tmp.off?.('resolved', resolvedHandler);
            tmp.stop();
          } catch {}
          resolve(Object.values(results));
        },
        Math.max(1000, timeoutMs),
      );
    });
  }

  /**
   * TCP port probing fallback when mDNS is not available (e.g., AP isolation).
   * Tries common private subnets and resolves any host accepting connections on `port`.
   */
  async fallbackScanTCP(
    port = 5555,
    timeoutMs = 350,
    prefixes = ['192.168.1', '192.168.0', '192.168.43', '172.20.10'],
  ): Promise<Service[]> {
    let tcp: any = null;
    try {
      tcp = require('react-native-tcp-socket');
    } catch {
      return [];
    }
    const candidates: string[] = [];
    prefixes.forEach((p) => {
      for (let i = 1; i < 255; i++) candidates.push(`${p}.${i}`);
    });
    const results: Service[] = [];
    const limit = 32;
    let idx = 0;

    const tryOne = (host: string) =>
      new Promise<void>((resolve) => {
        let done = false;
        const socket = tcp.createConnection({ host, port }, () => {
          if (done) return;
          done = true;
          try {
            socket.destroy();
          } catch {}
          results.push({ name: `tcp-${host}`, host, addresses: [host], port });
          resolve();
        });
        const timer = setTimeout(() => {
          if (done) return;
          done = true;
          try {
            socket.destroy();
          } catch {}
          resolve();
        }, timeoutMs);
        socket.on('error', () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          try {
            socket.destroy();
          } catch {}
          resolve();
        });
      });

    const workers = new Array(limit).fill(0).map(async () => {
      while (idx < candidates.length) {
        const host = candidates[idx++];
        await tryOne(host);
      }
    });
    await Promise.all(workers);
    return results;
  }
}

export const Zeroconf = new _ZeroconfWrapper();

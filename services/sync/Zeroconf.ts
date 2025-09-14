// services/sync/Zeroconf.ts
// Optional mDNS discovery/advertising using react-native-zeroconf.
// No-ops gracefully if the module is not available (Expo managed w/o plugin).

type Service = {
  name: string;
  host?: string;
  addresses?: string[];
  port?: number;
};

class _ZeroconfWrapper {
  private zc: any | null = null;
  private browsing = false;
  private advertising = false;

  private ensure() {
    if (this.zc) return;
    try {
      const Zeroconf = require('react-native-zeroconf');
      this.zc = new Zeroconf();
    } catch {
      this.zc = null;
    }
  }

  startAdvertising(serviceName: string, port: number, type = 'ordersapp', domain = 'local.') {
    this.ensure();
    if (!this.zc || this.advertising) return;
    try {
      this.zc.publishService(type, 'tcp', domain, serviceName, port, {});
      this.advertising = true;
    } catch {}
  }

  stopAdvertising() {
    if (!this.zc) return;
    try {
      this.zc.stop();
    } catch {}
    this.advertising = false;
  }

  startBrowsing(onService: (svc: Service) => void, type = 'ordersapp', domain = 'local.') {
    this.ensure();
    if (!this.zc || this.browsing) return;
    try {
      this.zc.on('resolved', (service: any) => {
        onService({
          name: service?.name,
          host: service?.host,
          addresses: service?.addresses,
          port: service?.port,
        });
      });
      this.zc.scan(type, 'tcp', domain);
      this.browsing = true;
    } catch {}
  }

  stopBrowsing() {
    if (!this.zc) return;
    try {
      this.zc.stop();
    } catch {}
    this.browsing = false;
  }
}

export const Zeroconf = new _ZeroconfWrapper();

// services/sync/SyncManager.ts
// Lightweight, defensive sync layer using optional react-native-tcp-socket.
// - Works in two modes: server (maître) and client.
// - If tcp module is not available (Expo managed without plugin), methods no-op gracefully.

type ActionName =
  | 'createOrder'
  | 'setOrderPaid'
  | 'deleteOrder'
  | 'addItemToOrder'
  | 'updateItemQty'
  | 'removeItemFromOrder'
  | 'addOrderComment'
  | 'setOrderStatus'
  | 'setOrderExpectedAt'
  | 'closeOrder';

type Message =
  | { type: 'HELLO'; from: string; name?: string }
  | { type: 'ACTION'; name: ActionName; args: any[]; from?: string }
  | { type: 'REQUEST_SNAPSHOT'; from: string }
  | { type: 'SNAPSHOT'; data: any; to?: string };

/**
 * Very small singleton to avoid wiring complexity everywhere.
 * It tries to require the tcp module dynamically to avoid crashes in Expo without plugin.
 */
class _SyncManager {
  private server: any | null = null;
  private client: any | null = null;
  private tcp: any | null = null;
  private isServer = false;
  private clients = new Set<any>();
  private onMessage?: (msg: Message) => void;

  constructor() {
    this.safeLoadTCP();
  }

  setOnMessage(handler: (msg: Message) => void) {
    this.onMessage = handler;
  }

  private safeLoadTCP() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.tcp = require('react-native-tcp-socket');
    } catch (e) {
      this.tcp = null;
    }
  }

  async startServer(port = 5555): Promise<void> {
    if (!this.tcp) return; // no-op if not available
    if (this.server) return;
    this.isServer = true;
    const { Server } = this.tcp;
    this.server = this.tcp.createServer((socket: any) => {
      this.clients.add(socket);
      socket.on('data', (data: any) => this.handleRaw(data, socket));
      socket.on('error', () => {});
      socket.on('close', () => {
        try {
          this.clients.delete(socket);
        } catch {}
      });
    });
    await new Promise<void>((resolve, reject) => {
      this.server.listen({ port, host: '0.0.0.0' }, resolve);
      this.server.on('error', reject);
    });
  }

  async stopServer(): Promise<void> {
    if (this.server) {
      try {
        this.server.close();
      } catch {}
      this.server = null;
    }
    this.isServer = false;
    this.clients.forEach((c) => {
      try {
        c.destroy?.();
      } catch {}
    });
    this.clients.clear();
  }

  async connectToServer(host?: string, port = 5555): Promise<void> {
    if (!this.tcp) return; // no-op
    if (!host) return;
    if (this.client) {
      try {
        this.client.destroy();
      } catch {}
    }
    const options = { port, host };
    this.client = this.tcp.createConnection(options, () => {
      // connected
    });
    this.client.on('data', (data: any) => this.handleRaw(data));
    this.client.on('error', () => {});
  }

  private handleRaw(data: any, originSock?: any) {
    try {
      const s = data?.toString?.() ?? '';
      const msg = JSON.parse(s) as Message;
      // Pass message to app store first
      this.onMessage?.(msg);
      // On server: relay certain messages to other clients
      if (this.isServer && (msg.type === 'ACTION' || msg.type === 'HELLO')) {
        this.broadcast(msg, originSock);
      }
      // REQUEST_SNAPSHOT and SNAPSHOT are handled by the store; no relay by default
    } catch {
      // ignore parse errors
    }
  }

  emitAction(name: ActionName, args: any[], from?: string) {
    const payload: Message = { type: 'ACTION', name, args, from };
    if (this.isServer) {
      // Server can proactively broadcast local changes (maître ui)
      this.broadcast(payload);
    } else {
      this.send(payload);
    }
  }

  send(msg: Message) {
    if (!this.tcp) return; // no-op
    const s = JSON.stringify(msg);
    if (this.isServer) {
      this.broadcast(msg);
      return;
    }
    if (this.client) {
      try {
        this.client.write(s);
      } catch {}
    }
  }

  private broadcast(msg: Message, except?: any) {
    if (!this.tcp) return;
    try {
      const s = JSON.stringify(msg);
      this.clients.forEach((c) => {
        if (except && c === except) return;
        try {
          c.write(s);
        } catch {}
      });
    } catch {}
  }
}

export const SyncManager = new _SyncManager();

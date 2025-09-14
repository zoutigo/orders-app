// store/useAppStore.ts
import {
  Category,
  Comment,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductCategoryCode,
  Table,
  TableStatus,
} from '@/types';
import {
  seedCategories,
  seedProducts,
  seedTables,
  seedRestaurants,
  defaultRestaurantId,
} from '@/constants/seeds';
import { Restaurant } from '@/types/restaurants';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Zeroconf } from '@/services/sync/Zeroconf';
import Constants from 'expo-constants';
import { SyncManager } from '@/services/sync/SyncManager';

const isoNow = () => new Date().toISOString();
const uid = (p = '') => `${p}${Math.random().toString(36).slice(2, 9)}`;
const isOrderActiveForTable = (o: Order) => o.status !== 'SERVIE';

export const computeOrderTotal = (order: Order) =>
  order.items.reduce((sum, it) => sum + it.price * it.qty, 0);

export type Role = 'owner' | 'supervisor' | 'waiter' | 'cashier' | 'preparator';

type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role?: Role | string;
  restaurantId?: string;
};

type MembershipStatus = 'pending' | 'accepted' | 'revoked';

type Membership = {
  id: string;
  restaurantId: string;
  userId: string;
  role: Role;
  status: MembershipStatus;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
};

type SocketStatus = 'disabled' | 'disconnected' | 'connecting' | 'connected' | 'error';

type AppState = {
  restaurants: Restaurant[];
  tables: Table[];
  categories: Category[];
  products: Product[];
  orders: Order[];

  // Multi-utilisateurs
  users: User[];
  currentUserId?: string;
  addUser: (_user: User) => void;
  updateUser: (_id: string, _updates: Partial<User>) => void;
  removeUser: (_id: string) => void;
  setCurrentUser: (_id: string) => void;
  logout: () => void;

  // Memberships & rôles
  memberships: Membership[];
  requestJoinRestaurant: (_restaurantId: string, _userId: string) => void;
  approveMembership: (_membershipId: string, _role: Role, _approvedBy: string) => void;
  revokeMembership: (_membershipId: string) => void;
  getUserRoleForRestaurant: (_userId: string, _restaurantId: string) => Role | undefined;

  // Restaurants (manquants auparavant)
  addRestaurant: (_resto: Restaurant) => void;
  updateRestaurant: (_id: string, _updates: Partial<Restaurant>) => void;
  deleteRestaurant: (_id: string) => void;

  // Restaurant courant
  currentRestaurantId?: string;
  setCurrentRestaurant: (_id?: string) => void;
  disconnectRestaurant: () => void;

  // Tables
  addTable: (_table: Table) => void;
  updateTable: (_id: string, _updates: Partial<Table>) => void;
  deleteTable: (_id: string) => void;

  // Produits
  addProduct: (_product: Product) => void;
  updateProduct: (_id: string, _updates: Partial<Product>) => void;
  deleteProduct: (_id: string) => void;
  toggleProductAvailability: (_id: string) => void;

  // Orders
  createOrder: (_restaurantId: string, _tableId?: string) => string;
  addItemToOrder: (_orderId: string, _productId: string, _qty?: number) => void;
  updateItemQty: (_orderId: string, _orderItemId: string, _qty: number) => void;
  removeItemFromOrder: (_orderId: string, _orderItemId: string) => void;
  addOrderComment: (_orderId: string, _role: Comment['role'], _message: string) => void;
  setOrderStatus: (_orderId: string, _status: OrderStatus) => void;
  closeOrder: (_orderId: string) => void;
  setOrderExpectedAt: (_orderId: string, _date: string) => void;
  // --- Dans type AppState
  setOrderPaid: (_orderId: string, _isPaid: boolean) => void;

  deleteOrder: (_orderId: string) => void;

  // Selectors
  getProductsByCategory: (_categoryId: string) => Product[];
  getProductsByCategoryCode: (_code: ProductCategoryCode) => Product[];
  getOrderTotal: (_orderId: string) => number;

  // Divers
  _hydrated?: boolean;
  hydrateDone: () => void;
  resetAll: () => void;

  // Sync / Socket & maître
  deviceId: string;
  masterDeviceId?: string;
  socketStatus: SocketStatus;
  serverHost?: string;
  serverPort: number;
  setServerAddress: (_host: string, _port?: number) => void;
  setMasterDevice: (_deviceId?: string) => void;
  setSocketStatus: (_status: SocketStatus) => void;
  startAsMaster: () => Promise<void>;
  connectToMaster: () => Promise<void>;
  stopMaster: () => Promise<void>;

  // Devices connectés (côté maître)
  connectedDevices: string[];
  connectedDeviceNames: Record<string, string>;
  upsertConnectedDevice: (_id: string, _name?: string) => void;
  applySnapshot: (_data: Partial<PersistedSlice>) => void;
};

// ----- Persist config
const STORE_VERSION = 7;

type PersistedSlice = Pick<
  AppState,
  | 'tables'
  | 'categories'
  | 'products'
  | 'orders'
  | 'restaurants'
  | 'users'
  | 'currentUserId'
  | 'currentRestaurantId'
  | 'memberships'
  | 'deviceId'
  | 'masterDeviceId'
  | 'serverHost'
  | 'serverPort'
>;

const persistSelector = (state: AppState): PersistedSlice => ({
  tables: state.tables,
  categories: state.categories,
  products: state.products,
  orders: state.orders,
  restaurants: state.restaurants,
  users: state.users,
  currentUserId: state.currentUserId,
  currentRestaurantId: state.currentRestaurantId,
  memberships: state.memberships,
  deviceId: state.deviceId,
  masterDeviceId: state.masterDeviceId,
  serverHost: state.serverHost,
  serverPort: state.serverPort,
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tables: seedTables,
      categories: seedCategories,
      products: seedProducts,
      orders: [],
      restaurants: seedRestaurants,
      users: [
        {
          id: 'u_owner',
          firstname: 'Owner',
          lastname: 'One',
          email: 'owner@restau.test',
          password: 'secret',
          // extra fields used in some screens (not required by type)
          role: 'owner',
          restaurantId: defaultRestaurantId,
        } as any,
        {
          id: 'u_waiter',
          firstname: 'Alice',
          lastname: 'Serveuse',
          email: 'waiter@restau.test',
          password: 'secret',
          role: 'waiter',
          restaurantId: defaultRestaurantId,
        } as any,
        {
          id: 'u_prep',
          firstname: 'Bob',
          lastname: 'Prepa',
          email: 'prepa@restau.test',
          password: 'secret',
          role: 'preparator',
          restaurantId: defaultRestaurantId,
        } as any,
        {
          id: 'u_cash',
          firstname: 'Claire',
          lastname: 'Caisse',
          email: 'cashier@restau.test',
          password: 'secret',
          role: 'cashier',
          restaurantId: defaultRestaurantId,
        } as any,
      ],
      memberships: [
        {
          id: 'm_owner',
          restaurantId: defaultRestaurantId,
          userId: 'u_owner',
          role: 'owner',
          status: 'accepted',
          approvedBy: 'u_owner',
          createdAt: isoNow(),
        },
        {
          id: 'm_waiter',
          restaurantId: defaultRestaurantId,
          userId: 'u_waiter',
          role: 'waiter',
          status: 'accepted',
          approvedBy: 'u_owner',
          createdAt: isoNow(),
        },
        {
          id: 'm_prep',
          restaurantId: defaultRestaurantId,
          userId: 'u_prep',
          role: 'preparator',
          status: 'accepted',
          approvedBy: 'u_owner',
          createdAt: isoNow(),
        },
        {
          id: 'm_cash',
          restaurantId: defaultRestaurantId,
          userId: 'u_cash',
          role: 'cashier',
          status: 'accepted',
          approvedBy: 'u_owner',
          createdAt: isoNow(),
        },
      ],
      currentUserId: undefined,
      currentRestaurantId: undefined,
      deviceId: `dev_${Math.random().toString(36).slice(2, 10)}`,
      masterDeviceId: undefined,
      socketStatus: 'disabled',
      serverHost: undefined,
      serverPort: 5555,
      connectedDevices: [],
      connectedDeviceNames: {},

      // Users
      addUser: (user) =>
        set((s) => ({ users: [...s.users, { ...user, id: user.id || uid('u_') }] })),
      updateUser: (id, updates) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...updates } : u)) })),
      removeUser: (id) =>
        set((s) => ({
          users: s.users.filter((u) => u.id !== id),
          currentUserId: s.currentUserId === id ? undefined : s.currentUserId,
        })),
      setCurrentUser: (id) => set({ currentUserId: id }),
      logout: () => set({ currentUserId: undefined, currentRestaurantId: undefined }),

      // Memberships & rôles
      requestJoinRestaurant: (restaurantId, userId) =>
        set((s) => ({
          memberships: [
            ...s.memberships,
            {
              id: uid('m_'),
              restaurantId,
              userId,
              role: 'waiter',
              status: 'pending',
              createdAt: isoNow(),
            },
          ],
        })),
      approveMembership: (membershipId, role, approvedBy) =>
        set((s) => ({
          memberships: s.memberships.map((m) =>
            m.id === membershipId
              ? { ...m, role, status: 'accepted', approvedBy, updatedAt: isoNow() }
              : m,
          ),
        })),
      revokeMembership: (membershipId) =>
        set((s) => ({
          memberships: s.memberships.map((m) =>
            m.id === membershipId ? { ...m, status: 'revoked', updatedAt: isoNow() } : m,
          ),
        })),
      getUserRoleForRestaurant: (userId, restaurantId) => {
        const m = get().memberships.find(
          (x) => x.userId === userId && x.restaurantId === restaurantId && x.status === 'accepted',
        );
        if (m) return m.role;
        const u = get().users.find((x) => x.id === userId) as any;
        if (u?.restaurantId === restaurantId && u?.role) return u.role as any;
        return undefined;
      },

      // Restaurants
      addRestaurant: (resto) =>
        set((s) => ({
          restaurants: [...s.restaurants, { ...resto, id: resto.id || uid('r_') }],
        })),
      updateRestaurant: (id, updates) =>
        set((s) => ({
          restaurants: s.restaurants.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      deleteRestaurant: (id) =>
        set((s) => ({ restaurants: s.restaurants.filter((r) => r.id !== id) })),
      setCurrentRestaurant: (id) => {
        set({ currentRestaurantId: id });
        const userId = get().currentUserId;
        if (id && userId) {
          const exists = get().memberships?.some(
            (m) => m.restaurantId === id && m.userId === userId && m.status !== 'revoked',
          );
          if (!exists) {
            // Première entrée: crée une demande d’adhésion en attente
            get().requestJoinRestaurant(id, userId);
          }
        }
      },
      disconnectRestaurant: () => set({ currentRestaurantId: undefined }),

      // Tables
      addTable: (table) =>
        set((s) => ({ tables: [...s.tables, { ...table, id: table.id || uid('T') }] })),
      updateTable: (id, updates) =>
        set((s) => ({ tables: s.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
      deleteTable: (id) => set((s) => ({ tables: s.tables.filter((t) => t.id !== id) })),

      // Products CRUD
      addProduct: (product) =>
        set((s) => ({
          products: [...s.products, { ...product, id: product.id || uid('P') }],
        })),
      updateProduct: (id, updates) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      toggleProductAvailability: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, isAvailable: !p.isAvailable } : p,
          ),
        })),

      // Orders
      createOrder: (restaurantId: string, tableId?: string) => {
        const orderId = uid('ord_');
        const order: Order = {
          id: orderId,
          tableId: tableId || 'takeaway',
          status: 'DRAFT' as OrderStatus, // statut initial
          items: [],
          comments: [],
          createdAt: isoNow(),
          expectedAt: undefined,
          isPaid: false,
          waiterId: get().currentUserId,
          preparatorId: undefined,
          cashierId: undefined,
          restaurantId,
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        const shouldEmit = !!(get().masterDeviceId && get().masterDeviceId !== get().deviceId);
        if (shouldEmit) {
          SyncManager.emitAction(
            'createOrder',
            [restaurantId, tableId ?? undefined],
            get().deviceId,
          );
        }
        return orderId;
      },
      // --- Dans le create(...) du store, aux côtés des autres actions
      setOrderPaid: (orderId, isPaid) => {
        const s = get();
        set({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, isPaid } : o)),
        });
        const shouldEmit = !!(get().masterDeviceId && get().masterDeviceId !== get().deviceId);
        if (shouldEmit) {
          SyncManager.emitAction('setOrderPaid', [orderId, isPaid], get().deviceId);
        }
      },

      deleteOrder: (orderId) => {
        const s = get();

        // On supprime la commande
        const toDelete = s.orders.find((o) => o.id === orderId);
        const remaining = s.orders.filter((o) => o.id !== orderId);

        // Si elle avait une table, on libère la table s'il n'y a plus d'autre commande active dessus
        let nextTables = s.tables;
        const tableId = toDelete?.tableId;

        if (tableId && tableId !== 'takeaway') {
          const stillActive = remaining.some(
            (o) => o.tableId === tableId && isOrderActiveForTable(o),
          );
          if (!stillActive) {
            nextTables = s.tables.map((t) =>
              t.id === tableId ? { ...t, status: 'LIBRE' as TableStatus } : t,
            );
          }
        }

        set({ orders: remaining, tables: nextTables });
        const shouldEmit = !!(get().masterDeviceId && get().masterDeviceId !== get().deviceId);
        if (shouldEmit) {
          SyncManager.emitAction('deleteOrder', [orderId], get().deviceId);
        }
      },

      addItemToOrder: (orderId, productId, qty = 1) => {
        const s = get();
        const order = s.orders.find((o) => o.id === orderId);
        const product = s.products.find((p) => p.id === productId);
        if (!order || !product) return;

        const existing = order.items.find((it) => it.productId === productId);
        let newItems: OrderItem[];

        if (existing) {
          newItems = order.items.map((it) =>
            it.id === existing.id ? { ...it, qty: it.qty + qty } : it,
          );
        } else {
          newItems = [
            ...order.items,
            {
              id: uid('it_'),
              productId,
              name: product.name,
              qty,
              price: product.price,
            },
          ];
        }

        set({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, items: newItems } : o)),
        });
        const shouldEmit = !!(get().masterDeviceId && get().masterDeviceId !== get().deviceId);
        if (shouldEmit) {
          SyncManager.emitAction('addItemToOrder', [orderId, productId, qty], get().deviceId);
        }
      },

      updateItemQty: (orderId, orderItemId, qty) => {
        const s = get();
        const clamped = Math.max(0, qty);
        set({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  items: o.items
                    .map((it) => (it.id === orderItemId ? { ...it, qty: clamped } : it))
                    .filter((it) => it.qty > 0),
                }
              : o,
          ),
        });
        const shouldEmit = !!(get().masterDeviceId && get().masterDeviceId !== get().deviceId);
        if (shouldEmit) {
          SyncManager.emitAction('updateItemQty', [orderId, orderItemId, qty], get().deviceId);
        }
      },

      removeItemFromOrder: (orderId, orderItemId) => {
        const s = get();
        set({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, items: o.items.filter((it) => it.id !== orderItemId) } : o,
          ),
        });
        const shouldEmit = !!(get().masterDeviceId && get().masterDeviceId !== get().deviceId);
        if (shouldEmit) {
          SyncManager.emitAction('removeItemFromOrder', [orderId, orderItemId], get().deviceId);
        }
      },

      addOrderComment: (orderId, role, message) => {
        const s = get();
        set({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  comments: [...o.comments, { id: uid('c_'), role, message, at: isoNow() }],
                }
              : o,
          ),
        });
        const shouldEmit = !!(get().masterDeviceId && get().masterDeviceId !== get().deviceId);
        if (shouldEmit) {
          SyncManager.emitAction('addOrderComment', [orderId, role, message], get().deviceId);
        }
      },

      setOrderStatus: (orderId, status) => {
        const s = get();

        // On met à jour les commandes
        const nextOrders = s.orders.map((o) => (o.id === orderId ? { ...o, status } : o));

        // Si on passe en ATTENTE_PREPA et que la commande a une table, on met la table en EN_SERVICE
        let nextTables = s.tables;
        if (status === ('ATTENTE_PREPA' as OrderStatus)) {
          const ord = s.orders.find((o) => o.id === orderId);
          const tableId = ord?.tableId;
          if (tableId && tableId !== 'takeaway') {
            nextTables = s.tables.map((t) =>
              t.id === tableId ? { ...t, status: 'EN_SERVICE' as TableStatus } : t,
            );
          }
        }

        set({ orders: nextOrders, tables: nextTables });
        const shouldEmit = !!(get().masterDeviceId && get().masterDeviceId !== get().deviceId);
        if (shouldEmit) {
          SyncManager.emitAction('setOrderStatus', [orderId, status], get().deviceId);
        }
      },

      setOrderExpectedAt: (orderId, date) => {
        const s = get();
        set({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, expectedAt: date } : o)),
        });
        const shouldEmit = !!(get().masterDeviceId && get().masterDeviceId !== get().deviceId);
        if (shouldEmit) {
          SyncManager.emitAction('setOrderExpectedAt', [orderId, date], get().deviceId);
        }
      },

      closeOrder: (orderId) => {
        const s = get();

        // On ferme la commande
        const updatedOrders = s.orders.map((o) =>
          o.id === orderId ? { ...o, status: 'SERVIE' as OrderStatus, isPaid: true } : o,
        );

        // Si la commande avait une table, on libère la table s'il n'y a plus d'autre commande active dessus
        const closed = s.orders.find((o) => o.id === orderId);
        const tableId = closed?.tableId;
        let nextTables = s.tables;

        if (tableId && tableId !== 'takeaway') {
          const stillActive = updatedOrders.some(
            (o) => o.tableId === tableId && isOrderActiveForTable(o),
          );
          if (!stillActive) {
            nextTables = s.tables.map((t) =>
              t.id === tableId ? { ...t, status: 'LIBRE' as TableStatus } : t,
            );
          }
        }

        set({ orders: updatedOrders, tables: nextTables });
        const shouldEmit = !!(get().masterDeviceId && get().masterDeviceId !== get().deviceId);
        if (shouldEmit) {
          SyncManager.emitAction('closeOrder', [orderId], get().deviceId);
        }
      },

      // Selectors
      getProductsByCategory: (categoryId) => {
        const s = get();
        const rid = s.currentRestaurantId;
        return s.products.filter(
          (p) => p.categoryId === categoryId && (!rid || p.restaurantId === rid),
        );
      },

      getProductsByCategoryCode: (code) => {
        const s = get();
        const cat = s.categories.find((c) => c.code === code);
        const rid = s.currentRestaurantId;
        return cat
          ? s.products.filter((p) => p.categoryId === cat.id && (!rid || p.restaurantId === rid))
          : [];
      },

      getOrderTotal: (orderId) => {
        const s = get();
        const order = s.orders.find((o) => o.id === orderId);
        return order ? computeOrderTotal(order) : 0;
      },

      // Divers
      _hydrated: false,
      hydrateDone: () => set({ _hydrated: true }),

      resetAll: () =>
        set(() => ({
          tables: seedTables,
          categories: seedCategories,
          products: seedProducts,
          orders: [],
          restaurants: seedRestaurants,
          users: [
            {
              id: 'u_owner',
              firstname: 'Owner',
              lastname: 'One',
              email: 'owner@restau.test',
              password: 'secret',
            } as any,
            {
              id: 'u_waiter',
              firstname: 'Alice',
              lastname: 'Serveuse',
              email: 'waiter@restau.test',
              password: 'secret',
            } as any,
            {
              id: 'u_prep',
              firstname: 'Bob',
              lastname: 'Prepa',
              email: 'prepa@restau.test',
              password: 'secret',
            } as any,
            {
              id: 'u_cash',
              firstname: 'Claire',
              lastname: 'Caisse',
              email: 'cashier@restau.test',
              password: 'secret',
            } as any,
          ],
          currentUserId: undefined,
          currentRestaurantId: undefined,
          memberships: [],
          masterDeviceId: undefined,
          socketStatus: 'disabled',
          serverHost: undefined,
          serverPort: 5555,
        })),

      // Sync / Socket
      setServerAddress: (host, port) =>
        set((s) => ({ serverHost: host, serverPort: port ?? s.serverPort })),
      setMasterDevice: (deviceId) => set({ masterDeviceId: deviceId }),
      setSocketStatus: (status) => set({ socketStatus: status }),
      upsertConnectedDevice: (id, name) =>
        set((s) => ({
          connectedDevices: s.connectedDevices.includes(id)
            ? s.connectedDevices
            : [...s.connectedDevices, id],
          connectedDeviceNames: name
            ? { ...s.connectedDeviceNames, [id]: name }
            : s.connectedDeviceNames,
        })),
      applySnapshot: (data) =>
        set((s) => ({
          // Merge snapshot selectively
          tables: data.tables ?? s.tables,
          categories: data.categories ?? s.categories,
          products: data.products ?? s.products,
          orders: data.orders ?? s.orders,
          restaurants: data.restaurants ?? s.restaurants,
          users: data.users ?? s.users,
          currentUserId: s.currentUserId,
          currentRestaurantId: s.currentRestaurantId,
          memberships: (data as any).memberships ?? s.memberships,
        })),
      startAsMaster: async () => {
        const s = get();
        try {
          set({ socketStatus: 'connecting' });
          await SyncManager.startServer(s.serverPort);
          set({ socketStatus: 'connected', masterDeviceId: s.deviceId });
          // Advertise via mDNS
          const deviceName = (Constants?.deviceName as any) || `Device-${s.deviceId.slice(-4)}`;
          const serviceName = `orders-master-${deviceName}-${s.deviceId.slice(-4)}`;
          Zeroconf.startAdvertising(serviceName, s.serverPort);
          // En tant que maître, ajouter mon propre nom dans la liste locale
          get().upsertConnectedDevice(s.deviceId, deviceName);
        } catch (e) {
          set({ socketStatus: 'error' });
        }
      },
      stopMaster: async () => {
        try {
          await SyncManager.stopServer();
        } catch {}
        try {
          Zeroconf.stopAdvertising();
        } catch {}
        set({ socketStatus: 'disabled', masterDeviceId: undefined, connectedDevices: [] });
      },
      connectToMaster: async () => {
        const s = get();
        try {
          if (!s.serverHost) throw new Error('serverHost missing');
          set({ socketStatus: 'connecting' });
          await SyncManager.connectToServer(s.serverHost, s.serverPort);
          set({ socketStatus: 'connected' });
          // Say hello + request snapshot (handled by server)
          const deviceName = (Constants?.deviceName as any) || `Device-${s.deviceId.slice(-4)}`;
          SyncManager.send({ type: 'HELLO', from: s.deviceId, name: deviceName } as any);
          // mini-cooldown then ask
          setTimeout(() => {
            (SyncManager as any).send({ type: 'REQUEST_SNAPSHOT', from: s.deviceId } as any);
          }, 200);
        } catch (e) {
          set({ socketStatus: 'error' });
        }
      },
    }),
    {
      name: 'pauline-store',
      version: STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: persistSelector,
      migrate: (persisted: any, fromVersion: number) => {
        if (!persisted) return persisted;
        if (fromVersion < 6) {
          // exemple de migration : on remet les produits seeds
          return { ...persisted, products: seedProducts };
        }
        if (fromVersion < 7) {
          return {
            ...persisted,
            memberships: persisted.memberships ?? [],
            serverPort: persisted.serverPort ?? 5555,
          };
        }
        return persisted;
      },
      onRehydrateStorage: () => (state, error) => {
        if (!error) state?.hydrateDone();
      },
    },
  ),
);

// Wire incoming sync messages to store actions (runs on maître server).
SyncManager.setOnMessage((msg) => {
  const s = useAppStore.getState();
  // Ignore echoes from myself
  if ((msg as any).from && (msg as any).from === s.deviceId) return;
  if (msg.type === 'HELLO') {
    const dev = (msg as any).from as string;
    const name = (msg as any).name as string | undefined;
    if (dev) s.upsertConnectedDevice(dev, name);
    return;
  }
  if (msg.type === 'REQUEST_SNAPSHOT') {
    // We're the maître; craft and send a snapshot
    const snapshot = ((): any => {
      const st = useAppStore.getState();
      return {
        tables: st.tables,
        categories: st.categories,
        products: st.products,
        orders: st.orders,
        restaurants: st.restaurants,
        users: st.users,
        memberships: st.memberships,
      };
    })();
    const to = (msg as any).from as string | undefined;
    (SyncManager as any).send({ type: 'SNAPSHOT', data: snapshot, to } as any);
    return;
  }
  if (msg.type === 'SNAPSHOT') {
    const target = (msg as any).to as string | undefined;
    if (target && target !== s.deviceId) return;
    s.applySnapshot((msg as any).data || {});
    return;
  }
  if (msg.type === 'CONTROL') {
    const cmd = (msg as any).cmd as string;
    const to = (msg as any).to as string | undefined;
    const from = (msg as any).from as string | undefined;
    if (cmd === 'BECOME_MASTER' && (!to || to === s.deviceId)) {
      // I'm asked to become master
      (async () => {
        await s.startAsMaster();
        // Notify others I am master; port already known in store
        SyncManager.send({ type: 'CONTROL', cmd: 'MASTER_STARTED', from: s.deviceId } as any);
      })();
      return;
    }
    if (cmd === 'MASTER_STARTED' && from && from !== s.deviceId) {
      // Another device became master. Try to discover it via mDNS and connect.
      (async () => {
        try {
          useAppStore.setState({ masterDeviceId: from, socketStatus: 'connecting' });
          const found = await Zeroconf.browseOnce(3000);
          // Heuristic: pick first orders-master-* service
          const svc = found.find((f) => (f.name || '').startsWith('orders-master-'));
          if (svc) {
            const addr = svc.addresses?.[0] || svc.host;
            const port = svc.port || s.serverPort;
            if (addr && port) {
              s.setServerAddress(addr, port);
              await s.connectToMaster();
            } else {
              useAppStore.setState({ socketStatus: 'error' });
            }
          } else {
            useAppStore.setState({ socketStatus: 'error' });
          }
        } catch {
          useAppStore.setState({ socketStatus: 'error' });
        }
      })();
      return;
    }
  }
  if (msg.type === 'ACTION') {
    switch (msg.name) {
      case 'createOrder':
        s.createOrder(msg.args[0], msg.args[1]);
        break;
      case 'setOrderPaid':
        s.setOrderPaid(msg.args[0], msg.args[1]);
        break;
      case 'deleteOrder':
        s.deleteOrder(msg.args[0]);
        break;
      case 'addItemToOrder':
        s.addItemToOrder(msg.args[0], msg.args[1], msg.args[2]);
        break;
      case 'updateItemQty':
        s.updateItemQty(msg.args[0], msg.args[1], msg.args[2]);
        break;
      case 'removeItemFromOrder':
        s.removeItemFromOrder(msg.args[0], msg.args[1]);
        break;
      case 'addOrderComment':
        s.addOrderComment(msg.args[0], msg.args[1], msg.args[2]);
        break;
      case 'setOrderStatus':
        s.setOrderStatus(msg.args[0], msg.args[1]);
        break;
      case 'setOrderExpectedAt':
        s.setOrderExpectedAt(msg.args[0], msg.args[1]);
        break;
      case 'closeOrder':
        s.closeOrder(msg.args[0]);
        break;
    }
  }
});

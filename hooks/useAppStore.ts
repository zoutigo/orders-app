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
import { seedCategories, seedProducts, seedTables } from '@/constants/seeds';
import { Restaurant } from '@/types/restaurants';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const isoNow = () => new Date().toISOString();
const uid = (p = '') => `${p}${Math.random().toString(36).slice(2, 9)}`;
const isOrderActiveForTable = (o: Order) => o.status !== 'SERVIE';

export const computeOrderTotal = (order: Order) =>
  order.items.reduce((sum, it) => sum + it.price * it.qty, 0);

type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

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
};

// ----- Persist config
const STORE_VERSION = 6;

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
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tables: seedTables,
      categories: seedCategories,
      products: seedProducts,
      orders: [],
      restaurants: [],
      users: [],
      currentUserId: undefined,
      currentRestaurantId: undefined,

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
      setCurrentRestaurant: (id) => set({ currentRestaurantId: id }),
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
        return orderId;
      },
      // --- Dans le create(...) du store, aux côtés des autres actions
      setOrderPaid: (orderId, isPaid) => {
        const s = get();
        set({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, isPaid } : o)),
        });
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
      },

      removeItemFromOrder: (orderId, orderItemId) => {
        const s = get();
        set({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, items: o.items.filter((it) => it.id !== orderItemId) } : o,
          ),
        });
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
      },

      setOrderExpectedAt: (orderId, date) => {
        const s = get();
        set({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, expectedAt: date } : o)),
        });
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
      },

      // Selectors
      getProductsByCategory: (categoryId) => {
        const s = get();
        return s.products.filter((p) => p.categoryId === categoryId);
      },

      getProductsByCategoryCode: (code) => {
        const s = get();
        const cat = s.categories.find((c) => c.code === code);
        return cat ? s.products.filter((p) => p.categoryId === cat.id) : [];
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
          tables: [],
          categories: seedCategories,
          products: seedProducts,
          orders: [],
          restaurants: [],
          users: [],
          currentUserId: undefined,
          currentRestaurantId: undefined,
        })),
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
        return persisted;
      },
      onRehydrateStorage: () => (state, error) => {
        if (!error) state?.hydrateDone();
      },
    },
  ),
);

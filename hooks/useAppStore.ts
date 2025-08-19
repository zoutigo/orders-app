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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// import {
//   Category,
//   Comment,
//   Order,
//   OrderItem,
//   OrderStatus,
//   Product,
//   ProductCategoryCode,
//   Table,
//   TableStatus,
// } from '@types';

const isoNow = () => new Date().toISOString();
const uid = (p = '') => `${p}${Math.random().toString(36).slice(2, 9)}`;

export const computeOrderTotal = (order: Order) =>
  order.items.reduce((sum, it) => sum + it.price * it.qty, 0);

type AppState = {
  tables: Table[];
  categories: Category[];
  products: Product[];
  orders: Order[];

  currentTableId?: string;
  currentOrderId?: string;

  setTableName: (_tableId: string, _name: string) => void;
  occupyTable: (_tableId: string) => void;
  freeTable: (_tableId: string) => void;
  openOrderForTable: (_tableId: string) => string;
  moveOrderToTable: (_orderId: string, _newTableId: string) => void;

  addItemToOrder: (_orderId: string, _productId: string, _qty?: number, _note?: string) => void;
  updateItemQty: (_orderId: string, _orderItemId: string, _qty: number) => void;
  removeItemFromOrder: (_orderId: string, _orderItemId: string) => void;
  addOrderComment: (_orderId: string, _role: Comment['role'], _message: string) => void;
  setOrderStatus: (_orderId: string, _status: OrderStatus) => void;
  closeOrder: (_orderId: string) => void;

  selectTable: (_tableId?: string) => void;
  selectOrder: (_orderId?: string) => void;

  getActiveOrderForTable: (_tableId: string) => Order | undefined;
  getProductsByCategory: (_categoryId: string) => Product[];
  getProductsByCategoryCode: (_code: ProductCategoryCode) => Product[];
  getOrderTotal: (_orderId: string) => number;

  _hydrated?: boolean;
  hydrateDone: () => void;
  resetAll: () => void;
};

const seedCategories: Category[] = [
  { id: 'cat-entree', code: 'ENTREE', name: 'Entrées' },
  { id: 'cat-plat', code: 'PLAT', name: 'Plats' },
  { id: 'cat-dessert', code: 'DESSERT', name: 'Desserts' },
  { id: 'cat-accomp', code: 'ACCOMP', name: 'Accompagnements' },
  { id: 'cat-suppl', code: 'SUPPL', name: 'Suppléments' },
];

const seedProducts: Product[] = [
  { id: 'p-ent-1', name: 'Mini-samoussas', categoryId: 'cat-entree', price: 800 },
  { id: 'p-ent-2', name: 'Salade fraîche', categoryId: 'cat-entree', price: 700 },
  { id: 'p-plt-1', name: 'Poulet DG', categoryId: 'cat-plat', price: 3500 },
  { id: 'p-plt-2', name: 'Poisson braisé', categoryId: 'cat-plat', price: 4000 },
  { id: 'p-des-1', name: 'Beignets banane', categoryId: 'cat-dessert', price: 600 },
  { id: 'p-des-2', name: 'Ananas frais', categoryId: 'cat-dessert', price: 500 },
  { id: 'p-acc-1', name: 'Plantains', categoryId: 'cat-accomp', price: 700 },
  { id: 'p-acc-2', name: 'Pommes sautées', categoryId: 'cat-accomp', price: 800 },
  { id: 'p-sup-1', name: 'Sauce piquante', categoryId: 'cat-suppl', price: 200 },
  { id: 'p-sup-2', name: 'Portion riz', categoryId: 'cat-suppl', price: 500 },
];

const seedTables: Table[] = Array.from({ length: 8 }, (_, i) => ({
  id: `T${i + 1}`,
  name: `Table ${i + 1}`,
  status: 'LIBRE' as TableStatus,
}));

const STORE_VERSION = 1;
const persistSelector = (state: AppState) => ({
  tables: state.tables,
  categories: state.categories,
  products: state.products,
  orders: state.orders,
  currentTableId: state.currentTableId,
  currentOrderId: state.currentOrderId,
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tables: seedTables,
      categories: seedCategories,
      products: seedProducts,
      orders: [],
      currentTableId: undefined,
      currentOrderId: undefined,

      setTableName: (tableId, name) =>
        set((s) => ({ tables: s.tables.map((t) => (t.id === tableId ? { ...t, name } : t)) })),

      occupyTable: (tableId) =>
        set((s) => ({
          tables: s.tables.map((t) => (t.id === tableId ? { ...t, status: 'OCCUPEE' } : t)),
        })),

      freeTable: (tableId) =>
        set((s) => ({
          tables: s.tables.map((t) =>
            t.id === tableId && !t.activeOrderId ? { ...t, status: 'LIBRE' } : t,
          ),
        })),

      openOrderForTable: (tableId) => {
        const state = get();
        const table = state.tables.find((t) => t.id === tableId);
        if (!table) throw new Error('Table inconnue');
        if (table.activeOrderId) {
          set({ currentTableId: tableId, currentOrderId: table.activeOrderId });
          return table.activeOrderId;
        }
        const orderId = '#' + (100 + state.orders.length + 1);
        const order: Order = {
          id: orderId,
          tableId,
          status: 'EN_ATTENTE',
          items: [],
          comments: [
            { id: uid('c_'), role: 'SERVEUR', message: 'Ouverture du ticket', at: isoNow() },
          ],
        };
        set((s) => ({
          orders: [order, ...s.orders],
          tables: s.tables.map((t) =>
            t.id === tableId ? { ...t, status: 'EN_SERVICE', activeOrderId: orderId } : t,
          ),
          currentTableId: tableId,
          currentOrderId: orderId,
        }));
        return orderId;
      },

      moveOrderToTable: (orderId, newTableId) => {
        const s = get();
        const order = s.orders.find((o) => o.id === orderId);
        const to = s.tables.find((t) => t.id === newTableId);
        if (!order || !to) return;
        if (to.activeOrderId && to.activeOrderId !== orderId) return;
        const from = s.tables.find((t) => t.id === order.tableId);
        set({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, tableId: newTableId } : o)),
          tables: s.tables.map((t) => {
            if (from && t.id === from.id) {
              return { ...t, activeOrderId: undefined, status: 'LIBRE' as TableStatus };
            }
            if (t.id === newTableId) {
              return { ...t, activeOrderId: orderId, status: 'EN_SERVICE' as TableStatus };
            }
            return t;
          }),
          currentTableId: newTableId,
        });
      },

      addItemToOrder: (orderId, productId, qty = 1, note) => {
        const s = get();
        const order = s.orders.find((o) => o.id === orderId);
        const product = s.products.find((p) => p.id === productId);
        if (!order || !product) return;
        const existing = order.items.find((it) => it.productId === productId && !it.note);
        let newItems: OrderItem[];
        if (existing && !note) {
          newItems = order.items.map((it) =>
            it.id === existing.id ? { ...it, qty: it.qty + qty } : it,
          );
        } else {
          newItems = [
            ...order.items,
            { id: uid('it_'), productId, name: product.name, qty, price: product.price, note },
          ];
        }
        set({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, items: newItems } : o)) });
      },

      updateItemQty: (orderId, orderItemId, qty) => {
        const s = get();
        set({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, items: o.items.map((it) => (it.id === orderItemId ? { ...it, qty } : it)) }
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
              ? { ...o, comments: [...o.comments, { id: uid('c_'), role, message, at: isoNow() }] }
              : o,
          ),
        });
      },

      setOrderStatus: (orderId, status) => {
        const s = get();
        set({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)) });
      },

      closeOrder: (orderId) => {
        const s = get();
        const order = s.orders.find((o) => o.id === orderId);
        if (!order) return;
        set({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: 'SERVIE' } : o)),
          tables: s.tables.map((t) =>
            t.id === order.tableId ? { ...t, status: 'LIBRE', activeOrderId: undefined } : t,
          ),
          currentOrderId: undefined,
        });
      },

      selectTable: (tableId) => set({ currentTableId: tableId }),
      selectOrder: (orderId) => set({ currentOrderId: orderId }),

      getActiveOrderForTable: (tableId) => {
        const s = get();
        const tid = s.tables.find((t) => t.id === tableId)?.activeOrderId;
        if (!tid) return undefined;
        return s.orders.find((o) => o.id === tid);
      },

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

      _hydrated: false,
      hydrateDone: () => set({ _hydrated: true }),
      resetAll: () =>
        set(() => ({
          tables: seedTables,
          categories: seedCategories,
          products: seedProducts,
          orders: [],
          currentTableId: undefined,
          currentOrderId: undefined,
        })),
    }),
    {
      name: 'pauline-store',
      version: STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: persistSelector,
      migrate: (persisted, fromVersion) => {
        if (!persisted) return persisted;
        if (fromVersion < 1) return persisted;
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        state?.hydrateDone();
      },
    },
  ),
);

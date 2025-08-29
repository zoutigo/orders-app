// hooks/useOrderComputed.ts
import { useMemo } from 'react';
import { useAppStore } from '@/hooks/useAppStore';

type OrderItemLite = { id: string; productId: string; name: string; qty: number; price: number };

export function useOrderComputed(orderId: string) {
  const order = useAppStore((s) => s.orders.find((o) => o.id === orderId));
  const categories = useAppStore((s) => s.categories);
  const products = useAppStore((s) => s.products);

  const orderItems: OrderItemLite[] = (order?.items as OrderItemLite[]) ?? [];

  const catById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.id, c.name);
    return m;
  }, [categories]);

  const prodById = useMemo(() => {
    const m = new Map<string, { id: string; name: string; categoryId: string }>();
    for (const p of products) m.set(p.id, { id: p.id, name: p.name, categoryId: p.categoryId });
    return m;
  }, [products]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, { name: string; items: OrderItemLite[] }> = {};
    for (const it of orderItems) {
      const prod = prodById.get(it.productId);
      const catName = (prod && catById.get(prod.categoryId)) ?? 'Autres';
      if (!groups[catName]) groups[catName] = { name: catName, items: [] };
      groups[catName].items.push(it);
    }
    return groups;
  }, [orderItems, prodById, catById]);

  const total = useMemo(() => orderItems.reduce((s, it) => s + it.qty * it.price, 0), [orderItems]);

  return { order, orderItems, groupedItems, total };
}

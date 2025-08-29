// hooks/useOrderActions.ts
import { useCallback } from 'react';
import { InteractionManager } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/hooks/useAppStore';

export function useOrderActions(orderId: string) {
  const setStatus = useAppStore((s) => s.setOrderStatus);
  const addComment = useAppStore((s) => s.addOrderComment);
  const deleteOrder = useAppStore((s) => s.deleteOrder);
  const order = useAppStore((s) => s.orders.find((o) => o.id === orderId));

  const goToWaiter = useCallback(() => {
    const rid = order?.restaurantId;
    InteractionManager.runAfterInteractions(() => {
      // 1) on tente de revenir au screen précédent (la liste waiter)
      router.back();
      // 2) fallback de sûreté: on force la route de la liste waiter
      if (rid) {
        setTimeout(() => {
          router.replace({
            pathname: '/restaurant/[id]/operations/waiter',
            params: { id: rid },
          });
        }, 0);
      }
    });
  }, [order?.restaurantId]);

  const addServerComment = useCallback(
    (text: string) => {
      const c = text.trim();
      if (!order || !c) return;
      addComment(orderId, 'SERVEUR', c);
    },
    [order, addComment, orderId],
  );

  const validate = useCallback(() => {
    if (!order) return;
    setStatus(orderId, 'ATTENTE_PREPA' as any);
    goToWaiter();
  }, [order, orderId, setStatus, goToWaiter]);

  const saveDraft = useCallback(() => {
    if (!order) return;
    setStatus(orderId, 'BROUILLON' as any);
    goToWaiter();
  }, [order, orderId, setStatus, goToWaiter]);

  const cancelOrder = useCallback(() => {
    if (!order) return;
    deleteOrder(orderId);
    goToWaiter();
  }, [order, orderId, deleteOrder, goToWaiter]);

  return { order, addServerComment, validate, saveDraft, cancelOrder };
}

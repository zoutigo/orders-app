// screens/WaiterOrderScreen.tsx
import React, { useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import CommentModal from '@/components/modals/CommentModal';
import ConfirmModal from '@/components/modals/ConfirmModal';
import ActionBar from '@/components/orders/ActionBar';
import GroupedItems from '@/components/orders/GroupedItems';
import { useOrderComputed } from '@/hooks/useOrderComputed';
import { useAppStore } from '@/hooks/useAppStore';

// 👉 Liste produits par catégorie
import ProductList from '@/components/orders/ProductList';
import { useOrderActions } from '@/hooks/useOrdersActions';

const Tab = createMaterialTopTabNavigator();
const screenWidth = Dimensions.get('window').width;

/* ---------- Onglet Synthèse : ton contenu actuel ---------- */
function SyntheseTabContent({ orderId }: { orderId: string }) {
  const { order, groupedItems, total } = useOrderComputed(orderId);
  const { addServerComment, validate, saveDraft, cancelOrder } = useOrderActions(orderId);

  // État UI (modales)
  const [isCommentOpen, setCommentOpen] = useState(false);
  const [isValidateOpen, setValidateOpen] = useState(false);
  const [isDraftOpen, setDraftOpen] = useState(false);
  const [isCancelOpen, setCancelOpen] = useState(false);
  const [comment, setComment] = useState('');

  if (!order) return <Text>Commande introuvable</Text>;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16, paddingBottom: 96 }}>
        <Text style={{ fontWeight: 'bold' }}>Commande {order.id}</Text>
        <Text>Statut : {order.status}</Text>
        <Text>{order.tableId ? `Table : ${order.tableId}` : '🥡 À emporter'}</Text>

        <GroupedItems groups={groupedItems} />

        <Text style={{ marginTop: 12, fontWeight: 'bold', fontSize: 16 }}>
          Total : {total} FCFA
        </Text>
      </View>

      <ActionBar
        onComment={() => setCommentOpen(true)}
        onValidate={() => setValidateOpen(true)}
        onDraft={() => setDraftOpen(true)}
        onCancel={() => setCancelOpen(true)}
      />

      {/* Modales */}
      <CommentModal
        visible={isCommentOpen}
        value={comment}
        onChange={setComment}
        onValidate={() => {
          addServerComment(comment);
          setComment('');
          setCommentOpen(false);
        }}
        onCancel={() => setCommentOpen(false)}
      />

      <ConfirmModal
        visible={isValidateOpen}
        title="Valider la commande"
        message="Confirmer la validation ? La commande passera en ATTENTE_PREPA."
        confirmText="Valider"
        cancelText="Annuler"
        onConfirm={() => {
          setValidateOpen(false);
          validate();
        }}
        onCancel={() => setValidateOpen(false)}
      />

      <ConfirmModal
        visible={isDraftOpen}
        title="Sauvegarder en brouillon"
        message="Confirmer l’enregistrement de la commande en brouillon ?"
        confirmText="Sauvegarder"
        cancelText="Annuler"
        onConfirm={() => {
          setDraftOpen(false);
          saveDraft();
        }}
        onCancel={() => setDraftOpen(false)}
      />

      <ConfirmModal
        visible={isCancelOpen}
        title="Annuler la commande"
        message="Êtes-vous sûr de vouloir annuler cette commande ?"
        confirmText="Oui, annuler"
        cancelText="Non"
        onConfirm={() => {
          setCancelOpen(false);
          cancelOrder();
        }}
        onCancel={() => setCancelOpen(false)}
      />
    </View>
  );
}

/* ---------- Écran avec les onglets : Synthèse + Catégories ---------- */
export default function WaiterOrderScreen({ orderId }: { orderId: string }) {
  const categories = useAppStore((s) => s.categories);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarIndicatorStyle: { backgroundColor: '#e74c3c' },
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarItemStyle: { width: screenWidth / 4 }, // ~4 visibles
        tabBarLabelStyle: { fontSize: 14 },
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: '#333',
      }}
    >
      <Tab.Screen name="Synthese" options={{ title: 'Synthèse' }}>
        {() => <SyntheseTabContent orderId={orderId} />}
      </Tab.Screen>

      {categories.map((cat) => (
        <Tab.Screen key={cat.id} name={`cat_${cat.code}`} options={{ title: cat.name }}>
          {() => <ProductList categoryId={cat.id} orderId={orderId} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}

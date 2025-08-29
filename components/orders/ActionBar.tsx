// components/orders/ActionBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

type Props = {
  onComment: () => void;
  onValidate: () => void;
  onDraft: () => void;
  onCancel: () => void;
};

export default function ActionBar({ onComment, onValidate, onDraft, onCancel }: Props) {
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
      }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={onComment}
          style={{ flex: 1, paddingVertical: 12, backgroundColor: '#3498db', borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
            ➕ Commentaire
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onValidate}
          style={{ flex: 1, paddingVertical: 12, backgroundColor: '#2ecc71', borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>✅ Valider</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDraft}
          style={{ flex: 1, paddingVertical: 12, backgroundColor: '#f39c12', borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
            💾 Brouillon
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          style={{ flex: 1, paddingVertical: 12, backgroundColor: '#e74c3c', borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>❌ Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

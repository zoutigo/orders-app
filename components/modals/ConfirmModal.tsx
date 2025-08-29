// components/modals/ConfirmModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Valider',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.35)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ width: '88%', backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>{title}</Text>
          <Text style={{ marginTop: 10, color: '#444' }}>{message}</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{ flex: 1, padding: 12, backgroundColor: '#e0e0e0', borderRadius: 8 }}
            >
              <Text style={{ textAlign: 'center', fontWeight: '600' }}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={{ flex: 1, padding: 12, backgroundColor: '#2ecc71', borderRadius: 8 }}
            >
              <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700' }}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

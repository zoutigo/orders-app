// components/modals/CommentModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';

type Props = {
  visible: boolean;
  value: string;
  onChange: (t: string) => void;
  onValidate: () => void;
  onCancel: () => void;
};

export default function CommentModal({ visible, value, onChange, onValidate, onCancel }: Props) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}
      >
        <Pressable style={{ flex: 1 }} onPress={onCancel} />
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Ajouter un commentaire</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Saisir votre commentaire…"
            multiline
            numberOfLines={4}
            style={{
              marginTop: 10,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 10,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{ flex: 1, padding: 12, backgroundColor: '#e0e0e0', borderRadius: 8 }}
            >
              <Text style={{ textAlign: 'center', fontWeight: '600' }}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onValidate}
              style={{ flex: 1, padding: 12, backgroundColor: '#3498db', borderRadius: 8 }}
            >
              <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700' }}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

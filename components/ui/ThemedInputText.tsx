import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { useController, Control } from 'react-hook-form';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

interface ThemedInputTextProps extends TextInputProps {
  name: string;
  control: Control<any>;
  label: string;
  rules?: object;
  icon?: keyof typeof Ionicons.glyphMap; // nom d’icône Ionicons
  isPassword?: boolean;
}

export default function ThemedInputText({
  name,
  control,
  label,
  rules,
  icon,
  isPassword,
  ...props
}: ThemedInputTextProps) {
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
  });

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = '#e53935';

  const [secure, setSecure] = useState(isPassword);

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>

      {/* Champ avec icônes */}
      <View style={[styles.inputContainer, { borderColor: error ? errorColor : borderColor }]}>
        {/* Icône gauche */}
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? errorColor : '#888'}
            style={{ marginRight: 8 }}
          />
        )}

        {/* Input */}
        <TextInput
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          secureTextEntry={secure}
          style={[styles.input, { color: textColor }]}
          placeholderTextColor="#999"
          {...props}
        />

        {/* Icône pour afficher/masquer mdp */}
        {isPassword && (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Ionicons
              name={secure ? 'eye-off' : 'eye'}
              size={20}
              color="#888"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Message d’erreur */}
      {error && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  errorText: {
    marginTop: 6,
    color: '#e53935',
    fontSize: 13,
  },
});

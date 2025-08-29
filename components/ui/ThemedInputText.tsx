import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { Control, Controller, RegisterOptions } from 'react-hook-form';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

/* =========================
 *  Base présentational (pas de RHF)
 * ========================= */
export type ThemedInputBaseProps = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  rightAdornment?: React.ReactNode;
  errorMessage?: string;
};

export function ThemedInputBase({
  label,
  icon,
  isPassword,
  rightAdornment,
  errorMessage,
  ...props
}: ThemedInputBaseProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const danger = '#e53935';
  const [secure, setSecure] = useState(!!isPassword);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: errorMessage ? danger : borderColor,
            backgroundColor: 'rgba(0,0,0,0.02)',
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={errorMessage ? danger : '#888'}
            style={{ marginRight: 8 }}
          />
        )}

        <TextInput
          {...props}
          secureTextEntry={secure}
          style={[styles.input, { color: textColor }]}
          placeholderTextColor="#999"
        />

        {rightAdornment}

        {isPassword && (
          <TouchableOpacity onPress={() => setSecure((s) => !s)} style={{ marginLeft: 8 }}>
            <Ionicons name={secure ? 'eye-off' : 'eye'} size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

/* =========================
 *  Wrapper RHF (typages assouplis pour compat compat)
 * ========================= */
type RHFProps = Omit<ThemedInputBaseProps, 'value' | 'onChangeText' | 'onBlur'> & {
  name: string;
  control: Control<any>; // <- relax
  rules?: RegisterOptions; // <- relax
};

export default function ThemedInputText({ name, control, rules, ...baseProps }: RHFProps) {
  return (
    <Controller
      control={control as Control<any>}
      name={name as any}
      rules={rules as any}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <ThemedInputBase
          {...(baseProps as ThemedInputBaseProps)}
          value={value as any}
          onChangeText={onChange as any}
          onBlur={onBlur as any}
          errorMessage={error?.message}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 16 },
  label: { marginBottom: 6, fontSize: 14, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 6 },
  errorText: { marginTop: 6, color: '#e53935', fontSize: 13 },
});

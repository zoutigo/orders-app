import React from 'react';
import { View, ScrollView, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';

import Toolbar from '@/components/ui/Toolbar';
import ToolbarSpacer from '@/components/ui/ToolbarSpacer';
import FormCard from '@/components/ui/FormCard';
import ThemedInputText from '@/components/ui/ThemedInputText';
import Button from '@/components/ui/Button';
import ButtonGroup from '@/components/ui/ButtonGroup';
import { ThemedText } from '@/components/ThemedText';

import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { radius, spacing } from '@/constants/theme';

type Kind = 'SUGGESTION' | 'BUG' | 'DEMANDE';
type FormData = { kind: Kind; subject: string; email?: string; message: string };

const kinds: { key: Kind; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'SUGGESTION', label: 'Suggestion', icon: 'bulb-outline' },
  { key: 'BUG', label: 'Bug', icon: 'bug-outline' },
  { key: 'DEMANDE', label: 'Demande', icon: 'chatbubble-ellipses-outline' },
];

export default function ContactScreen() {
  const theme = useColorScheme() ?? 'light';
  const C = Colors[theme];

  const { control, handleSubmit, setValue, watch, formState } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: { kind: 'SUGGESTION', subject: '', email: '', message: '' },
  });

  const currentKind = watch('kind');

  const onSubmit = (data: FormData) => {
    // Plug API ici si besoin
    Toast.show({
      type: 'success',
      text1: 'Message envoyé',
      text2: `Merci pour votre ${data.kind.toLowerCase()} 💌`,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <Toolbar title="Nous contacter" back variant="solid" sticky />
      <ToolbarSpacer customHeight={130} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing(2), paddingBottom: spacing(4) }}
        keyboardShouldPersistTaps="handled"
      >
        <FormCard cardStyle={{ paddingVertical: spacing(2), paddingHorizontal: spacing(2) }}>
          {/* Type */}
          <ThemedText type="defaultSemiBold" style={{ marginBottom: spacing(1) }}>
            Type de message
          </ThemedText>

          <ButtonGroup segmented fullWidth>
            {kinds.map((k) => {
              const active = currentKind === k.key;
              return (
                <Pressable
                  key={k.key}
                  onPress={() => setValue('kind', k.key, { shouldValidate: true })}
                  android_ripple={{ color: C.ripple }}
                  style={[styles.segmentBtn, { backgroundColor: active ? C.brand : 'transparent' }]}
                >
                  <Ionicons
                    name={k.icon}
                    size={16}
                    color={active ? 'white' : C.text}
                    style={{ marginRight: 6 }}
                  />
                  <ThemedText type="defaultSemiBold" style={{ color: active ? 'white' : C.text }}>
                    {k.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ButtonGroup>

          <View style={{ height: spacing(1.5) }} />

          <ThemedInputText
            name="subject"
            control={control}
            label="Sujet"
            placeholder="Ex: Amélioration de l’écran Serveur"
            icon="create-outline"
            rules={{ required: 'Sujet requis', minLength: { value: 3, message: 'Min. 3' } }}
          />

          <ThemedInputText
            name="email"
            control={control}
            label="Adresse e-mail (facultatif)"
            placeholder="ex: contact@monresto.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
            rules={{
              validate: (v: any) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email invalide',
            }}
          />

          {/* Message via TextInput contrôlé (pas ThemedInputText) */}
          <Controller
            control={control}
            name="message"
            rules={{ required: 'Message requis', minLength: { value: 10, message: 'Min. 10' } }}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <View style={{ marginBottom: spacing(2) }}>
                <ThemedText style={{ marginBottom: 6, color: C.text, fontWeight: '600' }}>
                  Message
                </ThemedText>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: error ? C.danger : C.border,
                    borderRadius: radius.md,
                    backgroundColor: C.card,
                  }}
                >
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Décrivez votre demande…"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    style={{
                      paddingHorizontal: spacing(1.25),
                      paddingVertical: spacing(1.25),
                      color: C.text,
                      minHeight: 120,
                    }}
                    placeholderTextColor={C.muted}
                  />
                </View>

                {error && (
                  <Text style={{ marginTop: 6, color: C.danger, fontSize: 13 }}>
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Button
            fullWidth
            size="lg"
            leftIcon="paper-plane-outline"
            onPress={handleSubmit(onSubmit)}
            disabled={formState.isSubmitting || !formState.isValid}
          >
            Envoyer
          </Button>
        </FormCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(1),
    borderRadius: radius.md,
  },
});

// app/tabs/profile/password.tsx
import React, { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useForm } from 'react-hook-form';

import FormCard from '@/components/ui/FormCard';
import Button from '@/components/ui/Button';
import ThemedInputText from '@/components/ui/ThemedInputText';
import { useAppStore } from '@/hooks/useAppStore';

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function TabsProfilePasswordScreen() {
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const updateUser = useAppStore((s) => s.updateUser);

  const me = useMemo(() => users.find((u) => u.id === currentUserId), [users, currentUserId]);

  useEffect(() => {
    if (!me) router.replace('/login');
  }, [me]);

  const { control, handleSubmit, getValues, formState } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = (data: FormData) => {
    if (!me) return;

    if (me.password !== data.currentPassword) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Mot de passe actuel incorrect ❌' });
      return;
    }
    if (data.newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: '6 caractères minimum' });
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Les mots de passe ne correspondent pas',
      });
      return;
    }

    updateUser(me.id, { password: data.newPassword });
    Toast.show({ type: 'success', text1: 'Mot de passe modifié 🔐' });
    router.back();
  };

  return (
    <FormCard>
      <ThemedInputText
        name="currentPassword"
        control={control}
        label="Mot de passe actuel"
        placeholder="••••••••"
        secureTextEntry
        autoCapitalize="none"
        icon="lock-closed-outline"
        isPassword
        rules={{ required: 'Requis' }}
      />
      <ThemedInputText
        name="newPassword"
        control={control}
        label="Nouveau mot de passe"
        placeholder="••••••••"
        secureTextEntry
        autoCapitalize="none"
        icon="key-outline"
        isPassword
        rules={{ required: 'Requis', minLength: { value: 6, message: 'Min. 6 caractères' } }}
      />
      <ThemedInputText
        name="confirmPassword"
        control={control}
        label="Confirmer le mot de passe"
        placeholder="••••••••"
        secureTextEntry
        autoCapitalize="none"
        icon="key-outline"
        isPassword
        rules={{
          required: 'Requis',
          validate: (v: any) => v === getValues('newPassword') || 'Les mots de passe diffèrent',
        }}
      />

      <Button
        fullWidth
        size="lg"
        onPress={handleSubmit(onSubmit)}
        disabled={formState.isSubmitting || !formState.isValid}
        leftIcon="shield-checkmark-outline"
      >
        Mettre à jour
      </Button>
    </FormCard>
  );
}

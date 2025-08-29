// app/tabs/profile/edit.tsx
import React, { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useForm } from 'react-hook-form';

import FormCard from '@/components/ui/FormCard';
import Button from '@/components/ui/Button';
import ThemedInputText from '@/components/ui/ThemedInputText';
import { useAppStore } from '@/hooks/useAppStore';

type FormData = {
  firstname: string;
  lastname: string;
  email: string;
};

export default function TabsEditProfileScreen() {
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const updateUser = useAppStore((s) => s.updateUser);

  const me = useMemo(() => users.find((u) => u.id === currentUserId), [users, currentUserId]);

  // redirection propre si pas de session
  useEffect(() => {
    if (!me) router.replace('/(auth)/login');
  }, [me]);

  const { control, handleSubmit, formState } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      firstname: me?.firstname ?? '',
      lastname: me?.lastname ?? '',
      email: me?.email ?? '',
    },
  });

  const onSubmit = (data: FormData) => {
    if (!me) return;

    // email unique
    const emailTaken = users.some(
      (u) => u.id !== me.id && u.email.toLowerCase() === data.email.toLowerCase(),
    );
    if (emailTaken) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Email déjà utilisé 🚫' });
      return;
    }

    updateUser(me.id, {
      firstname: data.firstname.trim(),
      lastname: data.lastname.trim(),
      email: data.email.trim(),
    });

    Toast.show({ type: 'success', text1: 'Profil mis à jour ✅' });
    router.back(); // retour au profil
  };

  return (
    <FormCard>
      <ThemedInputText
        name="firstname"
        control={control}
        label="Prénom"
        placeholder="Votre prénom"
        autoCapitalize="words"
        icon="person-outline"
        rules={{ required: 'Prénom requis', minLength: { value: 1, message: 'Min. 1' } }}
      />
      <ThemedInputText
        name="lastname"
        control={control}
        label="Nom"
        placeholder="Votre nom"
        autoCapitalize="words"
        icon="person-outline"
        rules={{ required: 'Nom requis', minLength: { value: 1, message: 'Min. 1' } }}
      />
      <ThemedInputText
        name="email"
        control={control}
        label="Adresse e-mail"
        placeholder="ex: contact@monresto.com"
        keyboardType="email-address"
        autoCapitalize="none"
        icon="mail-outline"
        rules={{
          required: 'Email requis',
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
        }}
      />

      <Button
        fullWidth
        size="lg"
        onPress={handleSubmit(onSubmit)}
        disabled={formState.isSubmitting || !formState.isValid}
        leftIcon="save-outline"
      >
        Enregistrer
      </Button>
    </FormCard>
  );
}

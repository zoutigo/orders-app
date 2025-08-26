import { View, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import Button from '@/components/ui/Button';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import ThemedInputText from '@/components/ui/ThemedInputText';
import Toast from 'react-native-toast-message';
import { useAppStore } from '@/hooks/useAppStore';
import FormCard from '../ui/FormCard';

type RegisterFormData = {
  email: string;
  password: string;
  lastname: string;
  firstname: string;
  passwordConfirm: string;
};

export default function RegisterForm() {
  const cardBg = useThemeColor({}, 'card');

  const addUser = useAppStore((s) => s.addUser);
  const users = useAppStore((s) => s.users);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const { control, handleSubmit, formState, getValues } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      lastname: '',
      firstname: '',
    },
    mode: 'onChange',
  });

  const { isSubmitting, isValid } = formState;

  const onSubmit = (data: RegisterFormData) => {
    try {
      // Vérifie si l’email existe déjà
      const exists = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (exists) {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Cet email est déjà utilisé 🚫',
        });
        return;
      }

      // Création de l’utilisateur
      const newUser = {
        id: Math.random().toString(36).slice(2, 9),
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
      };

      addUser(newUser);
      setCurrentUser(newUser.id);

      router.replace('/tabs');

      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Inscription réussie 🎉',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message || 'Une erreur est survenue',
      });
    }
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
        rules={{
          required: 'Votre prénom est requis',
          minLength: { value: 1, message: '1 caractère minimum' },
        }}
      />
      <ThemedInputText
        name="lastname"
        control={control}
        label="Nom"
        placeholder="Votre nom"
        autoCapitalize="words"
        icon="person-outline"
        rules={{
          required: 'Votre nom est requis',
          minLength: { value: 1, message: '1 caractère minimum' },
        }}
      />
      {/* Email */}
      <ThemedInputText
        name="email"
        control={control}
        label="Adresse e-mail"
        placeholder="ex: contact@monresto.com"
        keyboardType="email-address"
        autoCapitalize="none"
        icon="mail-outline"
        rules={{
          required: 'L’email est requis',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email invalide',
          },
        }}
      />
      {/* Mot de passe */}
      <ThemedInputText
        name="password"
        control={control}
        label="Mot de passe"
        placeholder="••••••••"
        secureTextEntry
        autoCapitalize="none"
        icon="lock-closed-outline"
        isPassword
        rules={{
          required: 'Le mot de passe est requis',
          minLength: { value: 6, message: '6 caractères minimum' },
        }}
      />
      <ThemedInputText
        name="passwordConfirm"
        control={control}
        label="Confirmer le mot de passe"
        placeholder="••••••••"
        secureTextEntry
        autoCapitalize="none"
        icon="lock-closed-outline"
        isPassword
        rules={{
          required: 'La confirmation est requise',
          validate: (value: any) =>
            value === getValues('password') || 'Les mots de passe ne correspondent pas',
        }}
      />
      <Button
        fullWidth
        size="lg"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || !isValid}
      >
        Inscription
      </Button>
    </FormCard>
  );
}

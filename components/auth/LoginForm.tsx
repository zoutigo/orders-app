import { View, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Button from '@/components/ui/Button';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import ThemedInputText from '@/components/ui/ThemedInputText';
import { useAppStore } from '@/hooks/useAppStore';
import FormCard from '../ui/FormCard';

type LoginData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const cardBg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');

  const { control, handleSubmit, getValues } = useForm<LoginData>({
    defaultValues: { email: '', password: '' },
  });

  const users = useAppStore((s) => s.users);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const onSubmit = (data: LoginData) => {
    const found = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());

    if (!found) {
      Alert.alert('Erreur', 'Aucun utilisateur trouvé avec cet email 🚫');
      return;
    }

    if (found.password !== data.password) {
      Alert.alert('Erreur', 'Mot de passe incorrect ❌');
      return;
    }

    // ouvre la session
    setCurrentUser(found.id);

    router.replace('/tabs');
  };

  return (
    <FormCard>
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

      {/* Bouton principal */}
      <Button fullWidth size="lg" onPress={handleSubmit(onSubmit)}>
        Connexion
      </Button>

      <Button
        fullWidth
        size="lg"
        variant="outline"
        onPress={() => router.push('/register')}
        style={{ marginVertical: 30 }}
      >
        Inscription
      </Button>
    </FormCard>
  );
}

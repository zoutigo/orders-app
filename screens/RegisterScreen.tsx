import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Button from '@/components/ui/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { router } from 'expo-router';
import { useForm, useFormState } from 'react-hook-form';
import ThemedInputText from '@/components/ui/ThemedInputText';
import { useAppStore } from '@/hooks/useAppStore';
import Toast from 'react-native-toast-message';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

type RegisterForm = {
  email: string;
  password: string;
  lastname: string;
  firstname: string;
  passwordConfirm: string;
};

export default function RegisterScreen() {
  const cardBg = useThemeColor({}, 'card'); // fond pastel
  const accent = useThemeColor({}, 'accent'); // couleur accent (orange/rouge)
  const text = useThemeColor({}, 'text'); // texte principal

  const setUser = useAppStore((s) => s.setUser);

  const { control, handleSubmit, formState, getValues } = useForm<RegisterForm>({
    defaultValues: { email: '', password: '', passwordConfirm: '', lastname: '', firstname: '' },
    mode: 'onChange',
  });

  const { isSubmitting, isValid } = formState;

  const onSubmit = (data: RegisterForm) => {
    console.log('inscription avec :', data);

    try {
      if (data.email === 'existant@client.com') {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Cet email est déjà utilisé 🚫',
        });
        return;
      }

      // enregistre l’utilisateur
      setUser({
        id: Math.random().toString(36).slice(2, 9),
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
      });

      router.push('/(auth)/profile');
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Inscription reussie',
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
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <ThemedInputText
          name="firstname"
          control={control}
          label="Prénom"
          placeholder="votre prénom"
          secureTextEntry
          autoCapitalize="none"
          icon="lock-closed-outline"
          isPassword
          rules={{
            required: 'Votre prénom est requis',
            minLength: { value: 1, message: '1 caractères minimum' },
          }}
        />
        <ThemedInputText
          name="lastname"
          control={control}
          label="Nom"
          placeholder="votre nom"
          secureTextEntry
          autoCapitalize="none"
          icon="lock-closed-outline"
          isPassword
          rules={{
            required: 'Votre nom est requis',
            minLength: { value: 1, message: '1 caractères minimum' },
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
          label="Confirmer le Mot de passe"
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          icon="lock-closed-outline"
          isPassword
          rules={{
            required: 'Le mot de passe est requis',
            validate: (value: any) =>
              value === getValues('password') || 'Les mots de pass ne correspondent pas',
          }}
        />

        <Button
          fullWidth
          size="lg"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || !isValid}
        >
          Connexion
        </Button>
      </View>

      {/* Bouton principal */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 100,
    padding: 4,
    height: '100%',
  },
  card: {
    width: '90%',
    height: '90%',
    borderRadius: 24,
    // paddingVertical: 10,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
});

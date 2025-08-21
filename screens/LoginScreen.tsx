import { View, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Button from '@/components/ui/Button';

export default function LoginScreen() {
  const accent = useThemeColor({}, 'accent'); // orange P
  const text = useThemeColor({}, 'text'); // texte principal

  return (
    <View style={styles.container}>
      {/* Input */}
      <View style={styles.form}>
        <ThemedText style={styles.label}>Adresse e-mail</ThemedText>
        <TextInput
          placeholder="ex: contact@monresto.com"
          style={styles.input}
          keyboardType="email-address"
        />

        <Button fullWidth size="lg" style={styles.button}>
          Continuer
        </Button>
      </View>

      {/* Footer */}
      <ThemedText style={styles.footer}>
        Un code vous sera envoyé.{'\n'}Fonctionne offline; vérification quand internet est dispo.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: 40,
    alignItems: 'flex-start',
  },
  form: {
    marginTop: 40,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
});

import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Button from '@/components/ui/Button';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  const cardBg = useThemeColor({}, 'card'); // fond pastel
  const accent = useThemeColor({}, 'accent'); // couleur accent (orange/rouge)
  const text = useThemeColor({}, 'text'); // texte principal

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={[styles.title, { color: text }]}>
        Gestion des commandes{'\n'}simplifiée pour votre resto
      </ThemedText>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        {/* Bouton principal */}
        <Button fullWidth size="lg" onPress={() => router.push('/(auth)/login')}>
          Connexion
        </Button>

        <Button
          fullWidth
          size="lg"
          variant="outline"
          onPress={() => router.push('/(auth)/register')}
          style={{ marginVertical: 30 }}
        >
          Inscription
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 4,
    height: '100%',
  },
  card: {
    flex: 1,
    justifyContent: 'flex-start',
    width: '95%',
    height: '72%',
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    marginTop: 100,
    marginBottom: 50,
    letterSpacing: 2,
    fontSize: 20,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
});

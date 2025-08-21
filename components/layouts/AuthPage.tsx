import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import LogoPauline from '@/components/LogoPauline';
import { LinearGradient } from 'expo-linear-gradient';
import Toolbar from '../ui/Toolbar';

type AuthPageProps = {
  children: React.ReactNode;
};

export default function AuthPage({ children }: AuthPageProps) {
  const route = useRoute();
  const titles: Record<string, string> = {
    register: 'Inscription',
    login: 'Connexion',
    welcome: 'Bienvenue',
  };

  // récupère le titre ou sinon fallback au nom brut
  const title = titles[route.name] ?? route.name;

  return (
    <LinearGradient colors={['#fff', '#fcefe9']} style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* HEADER */}
        <Toolbar
          title={route.name !== 'welcome' ? title : ''}
          variant="solid"
          back={route.name !== 'welcome'}
          sticky
          right={<LogoPauline />}
          style={{ height: '5%' }}
        ></Toolbar>

        {/* CONTENU CENTRAL */}
        <View style={styles.content}>{children}</View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>© 2025 Pauline</ThemedText>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'yellow',
    paddingTop: 40, // espace en haut pour le header
    width: '100%',
  },
  header: {
    alignItems: 'flex-start', // logo à gauche
    // marginBottom: 20,
    backgroundColor: 'green',
    height: '7%',
  },
  content: {
    flex: 1,
    justifyContent: 'center', // centre le contenu
  },
  footer: {
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'blue',
    height: '5%',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
});

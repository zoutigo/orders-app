// screens/WelcomeScreen.tsx
import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/ui/Button';
import ButtonGroup from '@/components/ui/ButtonGroup';
import { useState } from 'react';
import { Plus, Trash } from 'lucide-react-native';

import { View, StyleSheet } from 'react-native';
import IconButton from '@/components/ui/IconButton';

export default function WelcomeScreen() {
  const [selected, setSelected] = useState<'yes' | 'no' | null>(null);
  return (
    <View style={styles.container}>
      <ThemedText type="title">Bienvenue 👋</ThemedText>
      <ThemedText type="subtitle">Applicationstion de prise de commandes</ThemedText>
      <ThemedText>
        Commencezrtar à exploreriser votre app avec vos couleurs et vos polices.
      </ThemedText>
      <Button fullWidth variant="danger" size="md">
        {' '}
        Merci
      </Button>
      <ButtonGroup segmented fullWidth style={{ marginTop: 24 }}>
        <Button
          variant={selected === 'yes' ? 'primary' : 'ghost'}
          fullWidth
          onPress={() => setSelected('yes')}
        >
          Yes
        </Button>
        <Button
          variant={selected === 'no' ? 'danger' : 'ghost'}
          fullWidth
          onPress={() => setSelected('no')}
        >
          No
        </Button>
      </ButtonGroup>
      <>
        <IconButton icon={<Plus />} onPress={() => console.log('Add')} />
        <IconButton variant="outline" icon={<Plus />} />
        <IconButton variant="danger" icon={<Trash />} loading />
        <IconButton variant="ghost" icon={<Trash />} disabled />
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

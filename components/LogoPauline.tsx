import { Svg, Text, TSpan } from 'react-native-svg';
import { useThemeColor } from '@/hooks/useThemeColor';
import { View } from 'react-native';

export default function LogoPauline() {
  const accent = useThemeColor({}, 'accent'); // orange P
  const brand = useThemeColor({}, 'brand'); // bleu-vert "auline"

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={100} height={40} viewBox="0 0 300 120">
        <Text x="50%" y="75%" textAnchor="middle" fontFamily="Georgia">
          <TSpan fontWeight="bold" fontSize="70" fill={accent}>
            PROMPT
          </TSpan>
        </Text>
      </Svg>
    </View>
  );
}

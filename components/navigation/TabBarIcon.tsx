import { Ionicons } from '@expo/vector-icons';
import { View, type ColorValue } from 'react-native';

import { colors, radius } from '@/theme';

type TabBarIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: ColorValue;
};

/**
 * Icon used in the custom bottom tab bar. Focused tabs get a soft
 * rounded highlight behind the icon instead of just a color change,
 * so the active tab reads clearly at a glance.
 */
export function TabBarIcon({ name, focused, color }: TabBarIconProps) {
  return (
    <View
      style={{
        width: 48,
        height: 28,
        borderRadius: radius.pill,
        backgroundColor: focused ? colors.primaryMuted : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={20} color={color} />
    </View>
  );
}
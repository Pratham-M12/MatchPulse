import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors } from '@/theme';

type AppScreenProps = {
  children: ReactNode;
  edges?: readonly Edge[];
};

/** Full-width on phones; centered mobile column on web/desktop. */
export function AppScreen({ children, edges = ['top'] }: AppScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={edges}>
      <View style={{ flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' }}>{children}</View>
    </SafeAreaView>
  );
}

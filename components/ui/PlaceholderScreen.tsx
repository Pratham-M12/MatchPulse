import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

type PlaceholderScreenProps = {
  title: string;
  description: string;
};

/**
 * Placeholder for tabs that exist for navigation purposes but haven't
 * been built out yet. Real content lands in the "Other Core Screens"
 * milestone — this just keeps every tab functional in the meantime.
 */
export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm }}>
        <Typography variant="heading">{title}</Typography>
        <Typography variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
          {description}
        </Typography>
      </View>
    </SafeAreaView>
  );
}
import { View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

export function OfflineBanner() {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel="Offline. Showing cached data."
      style={{
        marginHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Typography variant="caption" color="warning">
        Offline — showing last saved scores
      </Typography>
    </View>
  );
}

export function DataMeta({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <Typography variant="caption" color="textDisabled">
      {label}
    </Typography>
  );
}

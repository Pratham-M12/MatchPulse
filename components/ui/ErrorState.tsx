import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

/**
 * Standard "couldn't load this" state with an optional Retry button,
 * per the app's Loading/Error/Empty pattern for API-driven sections.
 */
export function ErrorState({ message = 'Unable to load data.', onRetry }: ErrorStateProps) {
  return (
    <View style={{ alignItems: 'center', gap: spacing.sm, padding: spacing.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: radius.lg }}>
      <Typography variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
        {message}
      </Typography>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          style={({ pressed }) => ({
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.primarySubtle,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.primaryMuted,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Typography variant="caption" color="primary">
            Retry
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
}

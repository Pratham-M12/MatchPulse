import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

type EmptyStateProps = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View
      style={{
        minHeight: 180,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.divider,
      }}
    >
      <Typography variant="title" style={{ textAlign: 'center' }}>
        {title}
      </Typography>
      {message ? (
        <Typography variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
          {message}
        </Typography>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel} hitSlop={8}>
          <Typography variant="label" color="primary">
            {actionLabel}
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
}

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { hapticSelection } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  compact?: boolean;
  /** Optional visible target height for dense, touch-first filter rails. */
  minHeight?: number;
};

export function FilterChip({ label, selected = false, onPress, compact = false, minHeight }: FilterChipProps) {
  return (
    <Pressable
      onPress={() => {
        void hapticSelection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      {({ pressed }) => (
        <View
          style={{
            minHeight: minHeight ?? (compact ? 32 : 36),
            minWidth: 44,
            paddingHorizontal: compact ? spacing.sm : spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.pill,
            backgroundColor: selected ? colors.primarySubtle : colors.surface,
            borderWidth: 1,
            borderColor: selected ? colors.primaryMuted : colors.divider,
            opacity: pressed ? 0.8 : 1,
          }}
        >
          <Typography variant="caption" color={selected ? 'primary' : 'textSecondary'}>
            {label}
          </Typography>
        </View>
      )}
    </Pressable>
  );
}

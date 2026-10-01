import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  /** Optional trailing content, e.g. a FavoriteButton. */
  right?: React.ReactNode;
};

/**
 * Custom back-button header used atop pushed detail screens (Match,
 * Team, League). The root Stack hides its native header (headerShown:
 * false) so every screen controls its own header styling consistently.
 */
export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={({ pressed }) => ({
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: pressed ? colors.surfaceHighlight : colors.surface,
          borderWidth: 1,
          borderColor: colors.divider,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed ? 0.94 : 1 }],
        })}
      >
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
      </Pressable>
      <Typography variant="title" numberOfLines={1} style={{ flexShrink: 1, flexGrow: 1 }}>
        {title}
      </Typography>
      {right}
    </View>
  );
}

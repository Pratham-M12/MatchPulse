import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colorFromString, initialsFromName } from '@/lib/colorFromString';
import { colors, radius, spacing } from '@/theme';
import type { Competition } from '@/types/football';

type LeagueChipProps = {
  competition: Competition;
  selected?: boolean;
  onPress?: () => void;
};

/**
 * Compact pill used in the "Popular Leagues" horizontal list on the Home
 * Screen. Shows a small colored initial mark plus the league's full name.
 */
export function LeagueChip({ competition, selected = false, onPress }: LeagueChipProps) {
  const mark = competition.shortName?.[0] ?? initialsFromName(competition.name)[0];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${competition.name}${selected ? ', selected' : ''}`}
    >
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: selected ? colors.primarySubtle : colors.surface,
            borderWidth: 1,
            borderColor: selected ? colors.primary : colors.divider,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            opacity: pressed ? 0.82 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: colorFromString(competition.name),
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography style={{ fontSize: 11, lineHeight: 13, fontWeight: '700' }}>
              {mark}
            </Typography>
          </View>
          <Typography
            variant="caption"
            color={selected ? 'primary' : 'textPrimary'}
            style={{ fontWeight: selected ? '600' : '500' }}
            numberOfLines={1}
          >
            {competition.name}
          </Typography>
        </View>
      )}
    </Pressable>
  );
}

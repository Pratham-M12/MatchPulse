import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { Typography } from '@/components/ui/Typography';
import { colorFromString, initialsFromName } from '@/lib/colorFromString';
import { colors, radius, spacing } from '@/theme';
import type { LeagueSummary } from '@/types/football';

type LeagueCardProps = {
  league: LeagueSummary;
  onPress?: () => void;
  favorited?: boolean;
  onToggleFavorite?: () => void;
};

/**
 * League card for the Leagues tab: logo/initials, name, country, match
 * count, favorite toggle and a chevron - all in a single row.
 */
export function LeagueCard({ league, onPress, favorited = false, onToggleFavorite }: LeagueCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${league.name}`}
    >
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.base,
            borderWidth: 1,
            borderColor: favorited ? colors.primaryMuted : colors.divider,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            width: '100%',
            opacity: pressed ? 0.88 : 1,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colorFromString(league.name),
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography style={{ fontSize: 14, lineHeight: 18, fontWeight: '700' }}>
              {initialsFromName(league.shortName ?? league.name)}
            </Typography>
          </View>

          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Typography variant="title" numberOfLines={1}>
              {league.name}
            </Typography>
            {league.country ? (
              <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                {league.country}
              </Typography>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 0 }}>
            {league.matchCount !== undefined ? (
              <Typography variant="caption" color="textSecondary">
                {league.matchCount} matches
              </Typography>
            ) : null}
            {onToggleFavorite ? <FavoriteButton favorited={favorited} onToggle={onToggleFavorite} size={16} /> : null}
            <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

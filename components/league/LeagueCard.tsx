import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';

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
 * Competition catalogue card. It uses an official logo when one is supplied,
 * otherwise its deterministic initial mark keeps the identity recognizable.
 */
export function LeagueCard({ league, onPress, favorited = false, onToggleFavorite }: LeagueCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const identity = league.shortName ?? league.name;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${league.name}${league.country ? `, ${league.country}` : ''}${favorited ? ', following' : ''}`}
    >
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: favorited ? colors.primaryMuted : colors.divider,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            width: '100%',
            minHeight: 92,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          }}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: 56,
              height: 56,
              borderRadius: radius.md,
              backgroundColor: league.logoUrl && !hasImageError ? colors.surfaceHighlight : colorFromString(league.name),
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {league.logoUrl && !hasImageError ? (
              <Image
                source={{ uri: league.logoUrl }}
                style={{ width: 46, height: 46 }}
                resizeMode="contain"
                onError={() => setHasImageError(true)}
              />
            ) : (
              <Typography style={{ fontSize: 15, lineHeight: 19, fontWeight: '700' }}>
                {initialsFromName(identity)}
              </Typography>
            )}
          </View>

          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <Typography variant="title" numberOfLines={2}>
              {league.name}
            </Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
              {league.country ? (
                <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                  {league.country}
                </Typography>
              ) : null}
              {league.matchCount !== undefined ? (
                <Typography variant="caption" color="textSecondary">
                  {league.matchCount} matches
                </Typography>
              ) : null}
            </View>
            {favorited ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary }}
                />
                <Typography variant="overline" color="primary">Following</Typography>
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 0 }}>
            {onToggleFavorite ? <FavoriteButton favorited={favorited} onToggle={onToggleFavorite} size={30} /> : null}
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="chevron-forward" size={17} color={colors.textSecondary} />
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

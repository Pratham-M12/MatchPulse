import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { MatchList } from '@/components/home/MatchList';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { Match } from '@/types/football';

type YourMatchdaySectionProps = {
  favoriteTeamCount: number;
  matches: Match[];
  isLoading?: boolean;
  selectedLeagueId?: string;
  onMatchPress: (match: Match) => void;
  onSearchPress: () => void;
  onBrowseMatchesPress: () => void;
};

export function YourMatchdaySection({
  favoriteTeamCount,
  matches,
  isLoading = false,
  selectedLeagueId,
  onMatchPress,
  onSearchPress,
  onBrowseMatchesPress,
}: YourMatchdaySectionProps) {
  const followingLabel = `Following ${favoriteTeamCount} ${favoriteTeamCount === 1 ? 'club' : 'clubs'}`;

  // Case 1: No teams followed yet
  if (favoriteTeamCount === 0) {
    return (
      <View style={{ gap: spacing.sm }}>
        <View style={{ paddingHorizontal: spacing.base }}>
          <SectionTitle
            title="Your Matchday"
            actionLabel="Find clubs"
            onActionPress={onSearchPress}
            actionTouchTarget
          />
        </View>

        <View style={{ paddingHorizontal: spacing.base }}>
          <View
            style={{
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.primaryMuted,
              padding: spacing.md,
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primarySubtle,
                borderWidth: 1,
                borderColor: colors.primaryMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            </View>

            <Typography variant="title" style={{ textAlign: 'center', fontWeight: '700' }}>
              No followed teams yet
            </Typography>

            <Typography
              variant="caption"
              color="textSecondary"
              style={{ textAlign: 'center', maxWidth: 280 }}
            >
              Follow your favorite clubs to see their live matchday scores and upcoming fixtures right here.
            </Typography>

            <Pressable
              onPress={onSearchPress}
              accessibilityRole="button"
              accessibilityLabel="Search clubs to follow"
              hitSlop={8}
              style={({ pressed }) => ({
                marginTop: spacing.xs,
                backgroundColor: colors.primarySubtle,
                borderWidth: 1,
                borderColor: colors.primary,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.lg,
                minWidth: 44,
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Typography variant="caption" color="primary" style={{ fontWeight: '700' }}>
                Find clubs to follow
              </Typography>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Case 2: Teams are followed, but no fixtures found in currently available matchdays
  if (matches.length === 0 && !isLoading) {
    return (
      <View style={{ gap: spacing.sm }}>
        <View style={{ paddingHorizontal: spacing.base }}>
          <SectionTitle
            title="Your Matchday"
            actionLabel="All matches"
            onActionPress={onBrowseMatchesPress}
            actionTouchTarget
          />
        </View>

        <View style={{ paddingHorizontal: spacing.base }}>
          <View
            style={{
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: selectedLeagueId ? colors.primaryMuted : colors.border,
              padding: spacing.md,
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: selectedLeagueId ? colors.primarySubtle : colors.surfaceHighlight,
                borderWidth: selectedLeagueId ? 1 : 0,
                borderColor: colors.primaryMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="football-outline" size={22} color={selectedLeagueId ? colors.primary : colors.textDisabled} />
            </View>

            <Typography variant="title" style={{ textAlign: 'center', fontWeight: '700' }}>
              {selectedLeagueId ? 'No matches in selected league' : 'No matches today or tomorrow'}
            </Typography>

            <Typography
              variant="caption"
              color="textSecondary"
              style={{ textAlign: 'center', maxWidth: 300 }}
            >
              {selectedLeagueId
                ? 'None of your followed teams are playing in this competition in current fixtures.'
                : 'None of your followed teams have live or upcoming fixtures in the current matchday schedule.'}
            </Typography>

            <Pressable
              onPress={onBrowseMatchesPress}
              accessibilityRole="button"
              accessibilityLabel="Browse all scheduled matches"
              hitSlop={8}
              style={({ pressed }) => ({
                marginTop: spacing.xs,
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.lg,
                minWidth: 44,
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Typography variant="caption" color="textPrimary" style={{ fontWeight: '600' }}>
                Browse all matches
              </Typography>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Case 3: Followed teams have live/upcoming fixtures (or loading)
  return (
    <MatchList
      title="Your Matchday"
      subtitle={followingLabel}
      matches={matches}
      isLoading={isLoading}
      actionLabel="See all"
      onActionPress={onBrowseMatchesPress}
      onMatchPress={onMatchPress}
    />
  );
}

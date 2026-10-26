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
  // Case 1: No teams followed yet
  if (favoriteTeamCount === 0) {
    return (
      <View style={{ gap: spacing.md }}>
        <View style={{ paddingHorizontal: spacing.base }}>
          <SectionTitle
            title="Your Matchday"
            actionLabel="Find clubs"
            onActionPress={onSearchPress}
          />
        </View>

        <View style={{ paddingHorizontal: spacing.base }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surfaceHighlight,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xs,
              }}
            >
              <Ionicons name="calendar-outline" size={22} color={colors.textDisabled} />
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
                paddingVertical: spacing.sm,
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
      <View style={{ gap: spacing.md }}>
        <View style={{ paddingHorizontal: spacing.base }}>
          <SectionTitle
            title="Your Matchday"
            actionLabel="All matches"
            onActionPress={onBrowseMatchesPress}
          />
        </View>

        <View style={{ paddingHorizontal: spacing.base }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surfaceHighlight,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xs,
              }}
            >
              <Ionicons name="football-outline" size={22} color={colors.textDisabled} />
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
                paddingVertical: spacing.sm,
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
      matches={matches}
      isLoading={isLoading}
      actionLabel="See all"
      onActionPress={onBrowseMatchesPress}
      onMatchPress={onMatchPress}
    />
  );
}

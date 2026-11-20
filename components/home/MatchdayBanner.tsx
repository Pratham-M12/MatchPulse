import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { MatchScore } from '@/components/ui/MatchScore';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { describeMatchForAccessibility } from '@/lib/format/matchAccessibility';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { colors, radius, spacing } from '@/theme';
import type { Match } from '@/types/football';

type MatchdayBannerProps = {
  match: Match;
  /** A supporting strip when the same fixture is already represented by the primary hero. */
  compact?: boolean;
};

export function MatchdayBanner({ match, compact = false }: MatchdayBannerProps) {
  const router = useRouter();
  const timeFormat = usePreferencesStore((state) => state.timeFormat);
  const accessibilityLabel = `Your team match. ${describeMatchForAccessibility(match, timeFormat)}`;

  if (compact) {
    return (
      <Pressable
        onPress={() => router.push(`/match/${match.id}`)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Opens Match Centre"
        style={({ pressed }) => ({
          marginHorizontal: spacing.base,
          backgroundColor: colors.primarySubtle,
          borderWidth: 1,
          borderColor: colors.primaryMuted,
          borderRadius: radius.lg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          opacity: pressed ? 0.88 : 1,
        })}
      >
        <TeamLogo team={match.homeTeam} size={28} decorative />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Typography variant="overline" color="primary">YOUR TEAM IS LIVE</Typography>
          <Typography variant="label" numberOfLines={1}>
            {match.homeTeam.shortName} vs {match.awayTeam.shortName}
          </Typography>
        </View>
        <LiveIndicator minute={match.minute} />
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => router.push(`/match/${match.id}`)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens Match Centre"
      style={({ pressed }) => ({
        marginHorizontal: spacing.base,
        backgroundColor: colors.primarySubtle,
        borderWidth: 1,
        borderColor: colors.primaryMuted,
        borderRadius: radius.card,
        padding: spacing.lg,
        gap: spacing.md,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <Typography variant="overline" color="primary">
        YOUR TEAM IS PLAYING
      </Typography>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', gap: spacing.xs, flex: 1 }}>
          <TeamLogo team={match.homeTeam} size={44} decorative />
          <Typography variant="label" numberOfLines={1}>{match.homeTeam.shortName}</Typography>
        </View>
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <LiveIndicator minute={match.minute} />
          <MatchScore homeScore={match.homeScore} awayScore={match.awayScore} status={match.status} />
        </View>
        <View style={{ alignItems: 'center', gap: spacing.xs, flex: 1 }}>
          <TeamLogo team={match.awayTeam} size={44} decorative />
          <Typography variant="label" numberOfLines={1}>{match.awayTeam.shortName}</Typography>
        </View>
      </View>
      <Typography variant="caption" color="primary" style={{ textAlign: 'center' }}>
        View match
      </Typography>
    </Pressable>
  );
}

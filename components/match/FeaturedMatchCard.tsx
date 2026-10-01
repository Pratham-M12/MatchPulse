import { Pressable, View } from 'react-native';

import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { MatchScore } from '@/components/ui/MatchScore';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { formatKickoffShort } from '@/lib/format/datetime';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { colors, radius, spacing } from '@/theme';
import type { Match } from '@/types/football';

type FeaturedMatchCardProps = {
  match: Match;
  onPress?: () => void;
};

export function FeaturedMatchCard({ match, onPress }: FeaturedMatchCardProps) {
  const timeFormat = usePreferencesStore((state) => state.timeFormat);
  const { competition, homeTeam, awayTeam, homeScore, awayScore, status, minute, venue } = match;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${homeTeam.name} versus ${awayTeam.name}, ${status === 'live' ? 'live' : status}`}
      style={({ pressed }) => ({
        backgroundColor: colors.surfaceElevated,
        borderRadius: radius.card,
        padding: spacing.xl,
        gap: spacing.lg,
        borderWidth: 1,
        borderColor: status === 'live' ? colors.primaryMuted : colors.divider,
        overflow: 'hidden',
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', top: 0, left: spacing.xl, right: spacing.xl, height: 2,
          backgroundColor: status === 'live' ? colors.primary : colors.surfaceHighlight,
        }}
      />
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Typography variant="overline" color="textSecondary">
          {competition.name.toUpperCase()}
        </Typography>
        {status === 'live' ? (
          <LiveIndicator minute={minute} />
        ) : (
          <Typography variant="caption" color="textSecondary">
            {status === 'finished' ? 'Full time' : formatKickoffShort(match.kickoff, timeFormat)}
          </Typography>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, alignItems: 'center', gap: spacing.sm }}>
          <TeamLogo team={homeTeam} size={60} />
          <Typography variant="label" numberOfLines={1} style={{ textAlign: 'center' }}>
            {homeTeam.shortName}
          </Typography>
        </View>

        <View style={{ paddingHorizontal: spacing.md }}>
          <MatchScore homeScore={homeScore} awayScore={awayScore} status={status} />
        </View>

        <View style={{ flex: 1, alignItems: 'center', gap: spacing.sm }}>
          <TeamLogo team={awayTeam} size={60} />
          <Typography variant="label" numberOfLines={1} style={{ textAlign: 'center' }}>
            {awayTeam.shortName}
          </Typography>
        </View>
      </View>

      {venue ? (
        <Typography variant="caption" color="textSecondary" style={{ textAlign: 'center' }}>
          {venue}
        </Typography>
      ) : null}
    </Pressable>
  );
}

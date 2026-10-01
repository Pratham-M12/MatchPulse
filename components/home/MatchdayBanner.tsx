import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { MatchScore } from '@/components/ui/MatchScore';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { Match } from '@/types/football';

export function MatchdayBanner({ match }: { match: Match }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/match/${match.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Your team is playing. ${match.homeTeam.name} versus ${match.awayTeam.name}`}
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
          <TeamLogo team={match.homeTeam} size={44} />
          <Typography variant="label" numberOfLines={1}>{match.homeTeam.shortName}</Typography>
        </View>
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <LiveIndicator minute={match.minute} />
          <MatchScore homeScore={match.homeScore} awayScore={match.awayScore} status={match.status} />
        </View>
        <View style={{ alignItems: 'center', gap: spacing.xs, flex: 1 }}>
          <TeamLogo team={match.awayTeam} size={44} />
          <Typography variant="label" numberOfLines={1}>{match.awayTeam.shortName}</Typography>
        </View>
      </View>
      <Typography variant="caption" color="primary" style={{ textAlign: 'center' }}>
        View match
      </Typography>
    </Pressable>
  );
}

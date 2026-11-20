import { Pressable, View } from 'react-native';

import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { TopScorer } from '@/types/football';

type LeagueTopScorersProps = {
  scorers: TopScorer[];
  onPlayerPress: (playerId: string) => void;
};

function ScorerRow({ item, rank, onPress }: { item: TopScorer; rank: number; onPress: () => void }) {
  const accessibilityLabel = [
    `Rank ${rank}`,
    item.player.name,
    item.team.name,
    `${item.goals} goals`,
    item.assists !== undefined ? `${item.assists} assists` : undefined,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityHint="Opens player details">
      {({ pressed }) => (
        <View
          style={{
            minHeight: 64,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: rank === 1 ? colors.primarySubtle : colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: rank === 1 ? colors.primaryMuted : colors.divider,
            opacity: pressed ? 0.8 : 1,
          }}
        >
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: rank === 1 ? colors.primaryMuted : colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="label" color={rank === 1 ? 'primary' : 'textSecondary'}>{rank}</Typography>
          </View>
          <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <TeamLogo team={item.team} size={30} decorative />
            <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
              <Typography variant="label" numberOfLines={1}>{item.player.name}</Typography>
              <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                {item.team.name}{item.assists !== undefined ? ` · ${item.assists} assists` : ''}
              </Typography>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', minWidth: 40 }}>
            <Typography variant="score" style={{ fontSize: 24, lineHeight: 28 }}>{item.goals}</Typography>
            <Typography variant="overline" color="textSecondary">Goals</Typography>
          </View>
        </View>
      )}
    </Pressable>
  );
}

/** League Details scorer leaderboard; it keeps provider order and does not calculate tie-breakers. */
export function LeagueTopScorers({ scorers, onPlayerPress }: LeagueTopScorersProps) {
  return (
    <View style={{ backgroundColor: colors.surfaceElevated, borderRadius: radius.card, borderWidth: 1, borderColor: colors.divider, padding: spacing.md, gap: spacing.md }}>
      <View style={{ gap: 2 }}>
        <Typography variant="overline" color="primary">Top scorers</Typography>
        <Typography variant="caption" color="textSecondary">Ranked by the competition provider</Typography>
      </View>
      <View style={{ gap: spacing.xs }}>
        {scorers.map((item, index) => (
          <ScorerRow key={item.player.id} item={item} rank={index + 1} onPress={() => onPlayerPress(item.player.id)} />
        ))}
      </View>
    </View>
  );
}

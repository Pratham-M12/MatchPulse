import { View } from 'react-native';

import { StatRow } from '@/components/ui/StatRow';
import { spacing } from '@/theme';
import type { MatchStats } from '@/types/football';

type MatchStatsListProps = {
  stats: MatchStats;
};

/**
 * Renders a full MatchStats object as a stack of StatRow comparisons:
 * possession, shots, shots on target, corners, fouls, and cards.
 */
export function MatchStatsList({ stats }: MatchStatsListProps) {
  return (
    <View style={{ gap: spacing.lg }}>
      <StatRow label="Possession" homeValue={stats.possessionHome} awayValue={stats.possessionAway} suffix="%" />
      <StatRow label="Shots" homeValue={stats.shotsHome} awayValue={stats.shotsAway} />
      <StatRow
        label="Shots on target"
        homeValue={stats.shotsOnTargetHome}
        awayValue={stats.shotsOnTargetAway}
      />
      <StatRow label="Corners" homeValue={stats.cornersHome} awayValue={stats.cornersAway} />
      <StatRow label="Fouls" homeValue={stats.foulsHome} awayValue={stats.foulsAway} />
      <StatRow label="Yellow cards" homeValue={stats.yellowCardsHome} awayValue={stats.yellowCardsAway} />
      <StatRow label="Red cards" homeValue={stats.redCardsHome} awayValue={stats.redCardsAway} />
    </View>
  );
}
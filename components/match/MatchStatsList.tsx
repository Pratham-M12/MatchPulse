import { View } from 'react-native';

import { StatRow } from '@/components/ui/StatRow';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { Match, MatchStats } from '@/types/football';

type MatchStatsListProps = {
  stats: MatchStats;
  match: Match;
};

type Statistic = {
  label: string;
  homeKey: keyof MatchStats;
  awayKey: keyof MatchStats;
  variant?: 'count' | 'percentage';
  suffix?: string;
};

const STATISTIC_GROUPS: Array<{ title: string; statistics: Statistic[] }> = [
  {
    title: 'Possession',
    statistics: [{ label: 'Possession', homeKey: 'possessionHome', awayKey: 'possessionAway', variant: 'percentage', suffix: '%' }],
  },
  {
    title: 'Attack',
    statistics: [
      { label: 'Shots', homeKey: 'shotsHome', awayKey: 'shotsAway' },
      { label: 'Shots on target', homeKey: 'shotsOnTargetHome', awayKey: 'shotsOnTargetAway' },
      { label: 'Corners', homeKey: 'cornersHome', awayKey: 'cornersAway' },
    ],
  },
  {
    title: 'Discipline',
    statistics: [
      { label: 'Fouls', homeKey: 'foulsHome', awayKey: 'foulsAway' },
      { label: 'Yellow cards', homeKey: 'yellowCardsHome', awayKey: 'yellowCardsAway' },
      { label: 'Red cards', homeKey: 'redCardsHome', awayKey: 'redCardsAway' },
    ],
  },
];

function StatGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md }}>
      <Typography variant="overline" color="textSecondary">
        {title}
      </Typography>
      {children}
    </View>
  );
}

/**
 * Home-versus-away statistics grouped from the fields available in MatchStats.
 * It does not infer unavailable provider values or promote one team based on
 * statistics where a higher total is not inherently positive.
 */
export function MatchStatsList({ stats, match }: MatchStatsListProps) {
  const homeColor = match.homeTeam.color ?? colors.primary;
  const awayColor = match.awayTeam.color ?? colors.textSecondary;
  const hasAnyValue = STATISTIC_GROUPS.some(({ statistics }) =>
    statistics.some(({ homeKey, awayKey }) => stats[homeKey] !== undefined || stats[awayKey] !== undefined)
  );

  if (!hasAnyValue) {
    return <Typography color="textSecondary">Statistics are unavailable for this fixture.</Typography>;
  }

  return (
    <View style={{ gap: spacing.lg }}>
      <View accessibilityRole="text" accessibilityLabel={`Statistics compare ${match.homeTeam.name} at home with ${match.awayTeam.name} away`} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View accessible={false} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: homeColor, flexShrink: 0 }} />
          <Typography variant="overline" color="textSecondary" numberOfLines={1}>
            {match.homeTeam.shortName || match.homeTeam.name}
          </Typography>
        </View>
        <Typography variant="overline" color="textDisabled">HOME / AWAY</Typography>
        <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.xs }}>
          <Typography variant="overline" color="textSecondary" numberOfLines={1}>
            {match.awayTeam.shortName || match.awayTeam.name}
          </Typography>
          <View accessible={false} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: awayColor, flexShrink: 0 }} />
        </View>
      </View>

      {STATISTIC_GROUPS.map(({ title, statistics }) => (
        <StatGroup key={title} title={title}>
          {statistics.map(({ label, homeKey, awayKey, variant, suffix }, index) => (
            <View key={label} style={{ gap: spacing.md }}>
              <StatRow
                label={label}
                homeValue={stats[homeKey]}
                awayValue={stats[awayKey]}
                variant={variant}
                suffix={suffix}
                homeColor={homeColor}
                awayColor={awayColor}
              />
              {index < statistics.length - 1 ? <View style={{ height: 1, backgroundColor: colors.divider }} /> : null}
            </View>
          ))}
        </StatGroup>
      ))}
    </View>
  );
}

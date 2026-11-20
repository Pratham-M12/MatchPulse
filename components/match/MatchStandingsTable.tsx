import { Pressable, View } from 'react-native';

import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { LeagueTable, Match, StandingRow, Team } from '@/types/football';

type MatchStandingsTableProps = {
  table: LeagueTable;
  match: Match;
  onTeamPress: (team: Team) => void;
};

function matchTeamLabel(row: StandingRow, match: Match): 'Home team' | 'Away team' | undefined {
  if (row.team.id === match.homeTeam.id) return 'Home team';
  if (row.team.id === match.awayTeam.id) return 'Away team';
  return undefined;
}

function MatchStandingsRow({ row, match, onPress }: { row: StandingRow; match: Match; onPress: () => void }) {
  const matchTeam = matchTeamLabel(row, match);
  const accentColor =
    matchTeam === 'Home team'
      ? match.homeTeam.color ?? colors.primary
      : matchTeam === 'Away team'
        ? match.awayTeam.color ?? colors.textSecondary
        : colors.divider;
  const metadata = [matchTeam, row.description].filter(Boolean).join(' · ');
  const accessibilityLabel = [
    `Position ${row.rank}`,
    row.team.name,
    matchTeam,
    `Played ${row.played}`,
    `Goal difference ${row.goalDifference}`,
    `${row.points} points`,
    row.description,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens team details"
    >
      {({ pressed }) => (
        <View
          style={{
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: matchTeam ? colors.surfaceHighlight : colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: matchTeam ? accentColor : colors.divider,
            borderLeftWidth: 3,
            borderLeftColor: accentColor,
            opacity: pressed ? 0.78 : 1,
          }}
        >
          <Typography variant="label" color="textSecondary" style={{ width: 24, textAlign: 'center' }}>
            {row.rank}
          </Typography>
          <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <TeamLogo team={row.team} size={24} decorative />
            <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
              <Typography variant="label" numberOfLines={1}>
                {row.team.name}
              </Typography>
              {metadata ? <Typography variant="caption" color="textSecondary" numberOfLines={1}>{metadata}</Typography> : null}
            </View>
          </View>
          <Typography variant="caption" color="textSecondary" style={{ width: 26, textAlign: 'center' }}>
            {row.played}
          </Typography>
          <Typography variant="caption" color="textSecondary" style={{ width: 32, textAlign: 'center' }}>
            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
          </Typography>
          <Typography variant="label" style={{ width: 34, textAlign: 'right' }}>
            {row.points}
          </Typography>
        </View>
      )}
    </Pressable>
  );
}

/** Compact Match Centre standings table using the existing league-table contract. */
export function MatchStandingsTable({ table, match, onTeamPress }: MatchStandingsTableProps) {
  const groupNames = [...new Set(table.rows.map((row) => row.group).filter((group): group is string => Boolean(group)))];
  const groupLabel = groupNames.length === 1 ? groupNames[0] : undefined;

  return (
    <View style={{ backgroundColor: colors.surfaceElevated, borderRadius: radius.card, borderWidth: 1, borderColor: colors.divider, padding: spacing.md, gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Typography variant="overline" color="textSecondary" numberOfLines={1}>
            {groupLabel ?? 'LEAGUE TABLE'}
          </Typography>
          <Typography variant="caption" color="textDisabled" numberOfLines={1}>
            {table.competition.name} · {table.season}
          </Typography>
        </View>
        <Typography variant="overline" color="primary">STANDINGS</Typography>
      </View>

      <View accessible accessibilityRole="text" accessibilityLabel="Standings columns: position, team, played, goal difference, points" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, minHeight: 24 }}>
        <Typography variant="overline" color="textDisabled" style={{ width: 24, textAlign: 'center' }}>#</Typography>
        <Typography variant="overline" color="textDisabled" style={{ flex: 1 }}>TEAM</Typography>
        <Typography variant="overline" color="textDisabled" style={{ width: 26, textAlign: 'center' }}>P</Typography>
        <Typography variant="overline" color="textDisabled" style={{ width: 32, textAlign: 'center' }}>GD</Typography>
        <Typography variant="overline" color="textDisabled" style={{ width: 34, textAlign: 'right' }}>PTS</Typography>
      </View>

      <View style={{ gap: spacing.xs }}>
        {table.rows.slice(0, 20).map((row) => (
          <MatchStandingsRow key={row.team.id} row={row} match={match} onPress={() => onTeamPress(row.team)} />
        ))}
      </View>
    </View>
  );
}

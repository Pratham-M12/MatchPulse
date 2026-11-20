import { Pressable, View } from 'react-native';

import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { useIsFavoriteTeam } from '@/store/useFavoritesStore';
import { colors, radius, spacing } from '@/theme';
import type { LeagueTable, StandingRow, Team } from '@/types/football';

type LeagueStandingsTableProps = {
  table: LeagueTable;
  onTeamPress: (team: Team) => void;
};

type StandingGroup = {
  label?: string;
  rows: StandingRow[];
};

/** Keeps provider order intact while exposing any contiguous real group labels. */
function groupRows(rows: StandingRow[]): StandingGroup[] {
  return rows.reduce<StandingGroup[]>((groups, row) => {
    const label = row.group?.trim() || undefined;
    const current = groups[groups.length - 1];
    if (current?.label === label) {
      current.rows.push(row);
    } else {
      groups.push({ label, rows: [row] });
    }
    return groups;
  }, []);
}

function formatGoalDifference(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function LeagueStandingsRow({ row, onPress }: { row: StandingRow; onPress: () => void }) {
  const isFavorite = useIsFavoriteTeam(row.team.id);
  const metadata = [isFavorite ? 'Following' : undefined, row.description].filter(Boolean).join(' · ');
  const accessibilityLabel = [
    `Position ${row.rank}`,
    row.team.name,
    isFavorite ? 'Following' : undefined,
    `Played ${row.played}`,
    `Won ${row.wins}`,
    `Drew ${row.draws}`,
    `Lost ${row.losses}`,
    `Goals for ${row.goalsFor}`,
    `Goals against ${row.goalsAgainst}`,
    `Goal difference ${row.goalDifference}`,
    `${row.points} points`,
    row.form ? `Form ${row.form}` : undefined,
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
            minHeight: metadata ? 66 : 56,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: isFavorite ? colors.primarySubtle : colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: isFavorite ? colors.primaryMuted : colors.divider,
            borderLeftWidth: 3,
            borderLeftColor: row.description ? colors.primary : isFavorite ? colors.primaryMuted : colors.divider,
            opacity: pressed ? 0.8 : 1,
          }}
        >
          <Typography variant="label" color="textSecondary" style={{ width: 22, textAlign: 'center' }}>
            {row.rank}
          </Typography>
          <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <TeamLogo team={row.team} size={28} decorative />
            <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
              <Typography variant="label" numberOfLines={1}>
                {row.team.name}
              </Typography>
              {metadata ? <Typography variant="caption" color={isFavorite ? 'primary' : 'textSecondary'} numberOfLines={1}>{metadata}</Typography> : null}
            </View>
          </View>
          <Typography variant="caption" color="textSecondary" style={{ width: 24, textAlign: 'center' }}>
            {row.played}
          </Typography>
          <Typography variant="caption" color="textSecondary" style={{ width: 30, textAlign: 'center' }}>
            {formatGoalDifference(row.goalDifference)}
          </Typography>
          <Typography variant="title" style={{ width: 32, textAlign: 'right' }}>
            {row.points}
          </Typography>
        </View>
      )}
    </Pressable>
  );
}

/** Full League Details standings table; intentionally separate from Match Centre's compact table. */
export function LeagueStandingsTable({ table, onTeamPress }: LeagueStandingsTableProps) {
  const groups = groupRows(table.rows);

  return (
    <View style={{ backgroundColor: colors.surfaceElevated, borderRadius: radius.card, borderWidth: 1, borderColor: colors.divider, padding: spacing.md, gap: spacing.md }}>
      <View style={{ gap: 2 }}>
        <Typography variant="overline" color="primary">Standings</Typography>
        <Typography variant="caption" color="textSecondary">Position, club, played, goal difference and points</Typography>
      </View>

      {groups.map((group, index) => (
        <View key={`${group.label ?? 'standings'}-${index}`} style={{ gap: spacing.xs }}>
          {group.label ? (
            <Typography variant="overline" color="textSecondary" accessibilityRole="header">
              {group.label}
            </Typography>
          ) : null}
          <View
            accessible
            accessibilityRole="text"
            accessibilityLabel="Standings columns: position, club, played, goal difference, points"
            style={{ minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm }}
          >
            <Typography variant="overline" color="textDisabled" style={{ width: 22, textAlign: 'center' }}>#</Typography>
            <Typography variant="overline" color="textDisabled" style={{ flex: 1 }}>CLUB</Typography>
            <Typography variant="overline" color="textDisabled" style={{ width: 24, textAlign: 'center' }}>P</Typography>
            <Typography variant="overline" color="textDisabled" style={{ width: 30, textAlign: 'center' }}>GD</Typography>
            <Typography variant="overline" color="textDisabled" style={{ width: 32, textAlign: 'right' }}>PTS</Typography>
          </View>
          <View style={{ gap: spacing.xs }}>
            {group.rows.map((row) => <LeagueStandingsRow key={row.team.id} row={row} onPress={() => onTeamPress(row.team)} />)}
          </View>
        </View>
      ))}
    </View>
  );
}

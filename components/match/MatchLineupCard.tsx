import { Pressable, View } from 'react-native';

import { TeamLogo } from '@/components/ui/TeamLogo';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { LineupPlayer, MatchLineup } from '@/types/football';

type MatchLineupCardProps = {
  lineup: MatchLineup;
  accentColor: string;
  onPlayerPress: (playerId: string) => void;
};

type PitchRow = {
  row: number;
  players: Array<{ player: LineupPlayer; column: number }>;
};

function getPitchRows(players: LineupPlayer[]): PitchRow[] | undefined {
  const rows = new Map<number, Array<{ player: LineupPlayer; column: number }>>();

  for (const player of players) {
    const [row, column] = player.grid?.split(':') ?? [];
    const rowNumber = Number(row);
    const columnNumber = Number(column);
    if (!Number.isInteger(rowNumber) || rowNumber < 1 || !Number.isInteger(columnNumber) || columnNumber < 1) return undefined;
    const currentRow = rows.get(rowNumber) ?? [];
    currentRow.push({ player, column: columnNumber });
    rows.set(rowNumber, currentRow);
  }

  return rows.size
    ? [...rows.entries()].map(([row, rowPlayers]) => ({
        row,
        players: [...rowPlayers].sort((left, right) => left.column - right.column),
      }))
    : undefined;
}

function playerAccessibilityLabel(player: LineupPlayer, teamName: string, role: 'starter' | 'substitute'): string {
  return [
    player.name,
    teamName,
    role === 'starter' ? 'Starting eleven' : 'Substitute',
    player.number !== undefined ? `shirt number ${player.number}` : undefined,
    player.position,
  ]
    .filter(Boolean)
    .join('. ');
}

function PlayerListRow({
  player,
  teamName,
  role,
  accentColor,
  onPress,
}: {
  player: LineupPlayer;
  teamName: string;
  role: 'starter' | 'substitute';
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={playerAccessibilityLabel(player, teamName, role)}
      accessibilityHint="Opens player profile"
      style={({ pressed }) => ({ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, opacity: pressed ? 0.76 : 1 })}
    >
      <View accessible={false} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: accentColor, alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" style={{ fontWeight: '700' }}>
          {player.number ?? '—'}
        </Typography>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Typography variant="label" numberOfLines={1}>{player.name}</Typography>
      </View>
      {player.position ? <Typography variant="caption" color="textSecondary" numberOfLines={1}>{player.position}</Typography> : null}
    </Pressable>
  );
}

function FormationPitch({
  rows,
  teamName,
  accentColor,
  onPlayerPress,
}: {
  rows: PitchRow[];
  teamName: string;
  accentColor: string;
  onPlayerPress: (playerId: string) => void;
}) {
  return (
    <View style={{ minHeight: 300, borderRadius: radius.lg, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.divider, overflow: 'hidden', paddingVertical: spacing.sm }}>
      <View pointerEvents="none" accessible={false} style={{ position: 'absolute', top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm, borderWidth: 1, borderColor: colors.primaryMuted, borderRadius: radius.md }} />
      <View pointerEvents="none" accessible={false} style={{ position: 'absolute', top: '50%', left: spacing.sm, right: spacing.sm, height: 1, backgroundColor: colors.primaryMuted }} />
      <View pointerEvents="none" accessible={false} style={{ position: 'absolute', top: '50%', left: '50%', width: 48, height: 48, marginLeft: -24, marginTop: -24, borderRadius: 24, borderWidth: 1, borderColor: colors.primaryMuted }} />
      <View pointerEvents="none" accessible={false} style={{ position: 'absolute', top: spacing.sm, alignSelf: 'center', width: '38%', height: 26, borderWidth: 1, borderTopWidth: 0, borderColor: colors.primaryMuted }} />
      <View pointerEvents="none" accessible={false} style={{ position: 'absolute', bottom: spacing.sm, alignSelf: 'center', width: '38%', height: 26, borderWidth: 1, borderBottomWidth: 0, borderColor: colors.primaryMuted }} />

      <View style={{ flex: 1, justifyContent: 'space-around', gap: spacing.xs, paddingHorizontal: spacing.xs + 2 }}>
        {rows.map(({ row, players }) => (
          <View key={row} style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', gap: 2 }}>
            {players.map(({ player }) => (
              <Pressable
                key={player.id}
                onPress={() => onPlayerPress(player.id)}
                accessibilityRole="button"
                accessibilityLabel={playerAccessibilityLabel(player, teamName, 'starter')}
                accessibilityHint="Opens player profile"
                style={({ pressed }) => ({ flex: 1, minWidth: 0, maxWidth: 58, alignItems: 'center', gap: 2, opacity: pressed ? 0.76 : 1 })}
              >
                <View accessible={false} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: accentColor, alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" style={{ fontWeight: '700' }}>
                    {player.number ?? '—'}
                  </Typography>
                </View>
                <Typography variant="caption" numberOfLines={2} style={{ width: '100%', minHeight: 28, textAlign: 'center', fontSize: 10, lineHeight: 12 }}>
                  {player.name}
                </Typography>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

/** A team-specific starting XI, formation view, and substitutes bench. */
export function MatchLineupCard({ lineup, accentColor, onPlayerPress }: MatchLineupCardProps) {
  const pitchRows = getPitchRows(lineup.startXI);

  return (
    <View style={{ backgroundColor: colors.surfaceElevated, borderRadius: radius.card, borderWidth: 1, borderColor: colors.divider, padding: spacing.base, gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <TeamLogo team={lineup.team} size={32} decorative />
        <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
          <Typography variant="title" numberOfLines={1}>{lineup.team.name}</Typography>
          <Typography variant="caption" color="textSecondary">
            {lineup.formation ? `${lineup.formation} formation` : 'Starting XI'}
          </Typography>
        </View>
        {lineup.formation ? (
          <View style={{ borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4, backgroundColor: colors.primarySubtle }}>
            <Typography variant="overline" color="primary">{lineup.formation}</Typography>
          </View>
        ) : null}
      </View>

      {pitchRows ? (
        <FormationPitch rows={pitchRows} teamName={lineup.team.name} accentColor={accentColor} onPlayerPress={onPlayerPress} />
      ) : lineup.startXI.length ? (
        <View style={{ gap: spacing.xs }}>
          <Typography variant="overline" color="textSecondary">STARTING XI</Typography>
          {lineup.startXI.map((player) => (
            <PlayerListRow key={player.id} player={player} teamName={lineup.team.name} role="starter" accentColor={accentColor} onPress={() => onPlayerPress(player.id)} />
          ))}
        </View>
      ) : (
        <Typography color="textSecondary">Starting lineup unavailable.</Typography>
      )}

      {lineup.coach ? <Typography variant="caption" color="textSecondary">Coach · {lineup.coach}</Typography> : null}

      {lineup.substitutes.length ? (
        <View style={{ gap: spacing.xs }}>
          <Typography variant="overline" color="textSecondary">SUBSTITUTES</Typography>
          {lineup.substitutes.map((player) => (
            <PlayerListRow key={player.id} player={player} teamName={lineup.team.name} role="substitute" accentColor={accentColor} onPress={() => onPlayerPress(player.id)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

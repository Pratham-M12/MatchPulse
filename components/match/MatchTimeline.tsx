import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { Match, MatchEvent, MatchEventType } from '@/types/football';

type MatchTimelineProps = {
  events: MatchEvent[];
  match: Match;
  onPlayerPress?: (playerIdentifier: string) => void;
  highlightedId?: string;
};

const EVENT_ICON: Record<MatchEventType, string> = {
  goal: '⚽',
  yellow_card: '🟨',
  red_card: '🟥',
  substitution: '⇄',
};

function describeEvent(event: MatchEvent, match: Match): string {
  const teamName = event.team === 'home' ? match.homeTeam.shortName : match.awayTeam.shortName;
  switch (event.type) {
    case 'goal':
      return `Goal — ${event.player} (${teamName})`;
    case 'yellow_card':
      return `Yellow card — ${event.player} (${teamName})`;
    case 'red_card':
      return `Red card — ${event.player} (${teamName})`;
    case 'substitution':
      return `Substitution — ${event.player} (${teamName})`;
  }
}

/**
 * Chronological list of match events (goals, cards, substitutions).
 * Events are assumed to already be in minute order.
 */
export function MatchTimeline({ events, match, onPlayerPress, highlightedId }: MatchTimelineProps) {
  if (events.length === 0) {
    return (
      <Typography variant="body" color="textSecondary">
        No notable events yet.
      </Typography>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      {events.map((event) => (
        <View key={event.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: highlightedId === event.id ? colors.primarySubtle : undefined, borderRadius: radius.md, paddingVertical: 4 }}>
          <Typography variant="caption" color="textSecondary" style={{ width: 32 }}>
            {event.minute}'
          </Typography>
          <Typography style={{ fontSize: 16 }}>{EVENT_ICON[event.type]}</Typography>
          <View style={{ flex: 1 }}>
            {onPlayerPress ? <Pressable onPress={() => onPlayerPress(event.playerId ?? event.player)} accessibilityRole="button" accessibilityLabel={`Open ${event.player}`}><Typography variant="body">{describeEvent(event, match)}</Typography></Pressable> : <Typography variant="body">{describeEvent(event, match)}</Typography>}
            {event.detail ? (
              <Typography variant="caption" color="textSecondary">
                {event.detail}
              </Typography>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

import { Ionicons } from '@expo/vector-icons';
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

type EventPresentation = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: 'primary' | 'warning' | 'loss';
};

const EVENT_PRESENTATION: Record<MatchEventType, EventPresentation> = {
  goal: { icon: 'football-outline', label: 'Goal', color: 'primary' },
  yellow_card: { icon: 'card-outline', label: 'Yellow card', color: 'warning' },
  red_card: { icon: 'card-outline', label: 'Red card', color: 'loss' },
  substitution: { icon: 'swap-horizontal-outline', label: 'Substitution', color: 'primary' },
};

function formatEventMinute(event: MatchEvent): string {
  return Number.isFinite(event.minute) ? `${event.minute}'` : '—';
}

function eventAccessibilityLabel(event: MatchEvent, match: Match, presentation: EventPresentation): string {
  const teamName = event.team === 'home' ? match.homeTeam.name : match.awayTeam.name;
  const minute = Number.isFinite(event.minute) ? `at ${event.minute} minutes` : 'at an unavailable time';
  return [presentation.label, minute, event.player, teamName, event.detail].filter(Boolean).join('. ');
}

/**
 * Chronological event presentation for Match Centre. The repository supplies
 * events in provider order, so this component intentionally does not sort or
 * otherwise reinterpret them.
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
    <View>
      {events.map((event, index) => {
        const presentation = EVENT_PRESENTATION[event.type];
        const isAway = event.team === 'away';
        const team = isAway ? match.awayTeam : match.homeTeam;
        const accentColor = colors[presentation.color];
        const content = (
          <View
            style={{
              flex: 1,
              minWidth: 0,
              alignItems: isAway ? 'flex-end' : 'flex-start',
              gap: 2,
              paddingTop: 2,
              paddingBottom: index === events.length - 1 ? 0 : spacing.lg,
            }}
          >
            <View style={{ flexDirection: isAway ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing.xs, maxWidth: '100%' }}>
              <Typography variant="overline" color={presentation.color} numberOfLines={1}>
                {presentation.label.toUpperCase()}
              </Typography>
              <Typography variant="overline" color="textDisabled" numberOfLines={1}>
                {team.shortName || team.name}
              </Typography>
            </View>
            <Typography variant="title" numberOfLines={2} style={{ textAlign: isAway ? 'right' : 'left', width: '100%' }}>
              {event.player}
            </Typography>
            {event.detail ? (
              <Typography variant="caption" color="textSecondary" style={{ textAlign: isAway ? 'right' : 'left', width: '100%' }}>
                {event.detail}
              </Typography>
            ) : null}
          </View>
        );

        return (
          <View
            key={event.id}
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              borderRadius: radius.md,
              paddingHorizontal: highlightedId === event.id ? spacing.sm : 0,
              paddingTop: highlightedId === event.id ? spacing.sm : 0,
              backgroundColor: highlightedId === event.id ? colors.primarySubtle : colors.transparent,
            }}
          >
            <Typography variant="label" color="textSecondary" style={{ width: 34, textAlign: 'right', paddingTop: 5 }}>
              {formatEventMinute(event)}
            </Typography>

            <View style={{ width: 28, alignItems: 'center', alignSelf: 'stretch' }}>
              {index < events.length - 1 ? (
                <View pointerEvents="none" style={{ position: 'absolute', top: 28, bottom: 0, width: 1, backgroundColor: colors.divider }} />
              ) : null}
              <View
                accessible={false}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: presentation.color === 'primary' ? colors.primarySubtle : presentation.color === 'warning' ? 'rgba(244, 188, 98, 0.14)' : colors.liveMuted,
                  borderWidth: 1,
                  borderColor: accentColor,
                }}
              >
                <Ionicons name={presentation.icon} size={15} color={accentColor} />
              </View>
            </View>

            {onPlayerPress ? (
              <Pressable
                onPress={() => onPlayerPress(event.playerId ?? event.player)}
                accessibilityRole="button"
                accessibilityLabel={eventAccessibilityLabel(event, match, presentation)}
                accessibilityHint="Opens player profile"
                style={({ pressed }) => ({ flex: 1, minWidth: 0, opacity: pressed ? 0.78 : 1 })}
              >
                {content}
              </Pressable>
            ) : (
              <View accessible accessibilityLabel={eventAccessibilityLabel(event, match, presentation)} style={{ flex: 1, minWidth: 0 }}>
                {content}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

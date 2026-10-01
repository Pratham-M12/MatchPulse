import type { ApiFixtureEvent } from '@/lib/api/dto/eventDto';
import type { MatchEvent, MatchEventType } from '@/types/football';

function mapEventType(apiEvent: ApiFixtureEvent): MatchEventType | undefined {
  if (apiEvent.type === 'Goal') return 'goal';
  if (apiEvent.type === 'subst') return 'substitution';
  if (apiEvent.type === 'Card') {
    return apiEvent.detail === 'Red Card' ? 'red_card' : 'yellow_card';
  }
  // Other API event types (e.g. 'Var') aren't part of our MatchEventType union — skip them.
  return undefined;
}

/**
 * Maps raw API-Football fixture events to our domain MatchEvent[],
 * dropping event types we don't render (e.g. VAR reviews) and figuring
 * out home/away by comparing each event's team id against the match's
 * home team id.
 */
export function mapEventsToMatchEvents(apiEvents: ApiFixtureEvent[], homeTeamId: string): MatchEvent[] {
  return apiEvents
    .map((apiEvent, index): MatchEvent | undefined => {
      const type = mapEventType(apiEvent);
      if (!type) return undefined;

      return {
        id: `${apiEvent.time.elapsed}-${index}`,
        minute: apiEvent.time.elapsed,
        type,
        team: String(apiEvent.team.id) === homeTeamId ? 'home' : 'away',
        player: apiEvent.player.name ?? 'Unknown player',
        playerId: apiEvent.player.id != null ? String(apiEvent.player.id) : undefined,
        detail: apiEvent.assist.name ? `Assist: ${apiEvent.assist.name}` : undefined,
      };
    })
    .filter((event): event is MatchEvent => event !== undefined);
}
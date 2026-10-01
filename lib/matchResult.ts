import type { Match } from '@/types/football';

export type MatchResult = 'W' | 'D' | 'L';

/**
 * Returns the result ('W' | 'D' | 'L') for `teamId` in a finished match,
 * or null if the match isn't finished, has no scores, or doesn't
 * involve this team. Used for "recent form" strips on Team Details.
 */
export function getResultForTeam(match: Match, teamId: string): MatchResult | null {
  if (match.status !== 'finished' || match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }

  const isHome = match.homeTeam.id === teamId;
  const isAway = match.awayTeam.id === teamId;
  if (!isHome && !isAway) return null;

  if (match.homeScore === match.awayScore) return 'D';

  const teamWon = isHome ? match.homeScore > match.awayScore : match.awayScore > match.homeScore;
  return teamWon ? 'W' : 'L';
}
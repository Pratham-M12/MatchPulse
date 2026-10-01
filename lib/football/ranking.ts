import { competitionIdToApiLeagueId } from '@/lib/api/leagueIds';
import type { Match } from '@/types/football';

export type RankingContext = {
  favoriteTeamIds: string[];
  favoriteLeagueIds: string[];
  now?: number;
};

const POPULAR_COMPETITION_IDS = new Set(Object.keys(competitionIdToApiLeagueId));

/**
 * Deterministic “what should I watch” score. Isolated from UI.
 */
export function scoreMatch(match: Match, context: RankingContext): number {
  const now = context.now ?? Date.now();
  let score = 0;

  const involvesFavorite =
    context.favoriteTeamIds.includes(match.homeTeam.id) ||
    context.favoriteTeamIds.includes(match.awayTeam.id);

  if (involvesFavorite) score += 80;
  if (match.status === 'live') score += 70;
  if (context.favoriteLeagueIds.includes(match.competition.id)) score += 28;
  if (POPULAR_COMPETITION_IDS.has(match.competition.id)) score += 12;

  const kickoff = new Date(match.kickoff).getTime();
  const hoursUntil = (kickoff - now) / 3_600_000;
  if (match.status === 'scheduled') {
    if (hoursUntil >= 0 && hoursUntil < 3) score += 24;
    else if (hoursUntil >= 0 && hoursUntil < 12) score += 16;
    else if (hoursUntil >= 0 && hoursUntil < 36) score += 8;
  }

  if (match.status === 'finished') {
    const hoursAgo = (now - kickoff) / 3_600_000;
    if (hoursAgo < 8) score += 6;
  }

  return score;
}

export function rankMatches(matches: Match[], context: RankingContext): Match[] {
  return [...matches].sort((a, b) => scoreMatch(b, context) - scoreMatch(a, context));
}

export function uniqueMatches(matches: Match[]): Match[] {
  return Array.from(new Map(matches.map((match) => [match.id, match])).values());
}

export function involvesTeam(match: Match, teamIds: string[]): boolean {
  return teamIds.includes(match.homeTeam.id) || teamIds.includes(match.awayTeam.id);
}

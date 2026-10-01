import { getResultForTeam } from '@/lib/matchResult';
import type { Match } from '@/types/football';

/** Insights are generated only from matches we actually have. Never invented. */
export function insightsForTeam(teamName: string, teamId: string, matches: Match[]): string[] {
  const finished = matches
    .filter((match) => match.status === 'finished')
    .sort((a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime());

  if (finished.length === 0) return [];

  const insights: string[] = [];
  const lastFive = finished.slice(0, 5);
  const wins = lastFive.filter((match) => getResultForTeam(match, teamId) === 'W').length;
  if (lastFive.length >= 3) {
    insights.push(`${teamName} have won ${wins} of their last ${lastFive.length}.`);
  }

  let scoringRun = 0;
  for (const match of lastFive) {
    const isHome = match.homeTeam.id === teamId;
    const scored = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
    if (scored > 0) scoringRun += 1;
    else break;
  }
  if (scoringRun >= 3) {
    insights.push(`${teamName} have scored in their last ${scoringRun} matches.`);
  }

  let unbeaten = 0;
  for (const match of lastFive) {
    const result = getResultForTeam(match, teamId);
    if (result === 'W' || result === 'D') unbeaten += 1;
    else break;
  }
  if (unbeaten >= 3) {
    insights.push(`${teamName} are unbeaten in their last ${unbeaten}.`);
  }

  return insights.slice(0, 2);
}

export function insightsForMatch(match: Match, recentByTeam: Record<string, Match[]>): string[] {
  return [
    ...insightsForTeam(match.homeTeam.name, match.homeTeam.id, recentByTeam[match.homeTeam.id] ?? []),
    ...insightsForTeam(match.awayTeam.name, match.awayTeam.id, recentByTeam[match.awayTeam.id] ?? []),
  ].slice(0, 3);
}

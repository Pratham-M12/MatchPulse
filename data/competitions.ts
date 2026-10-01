import type { Competition } from '@/types/football';

/**
 * Mock competitions. Real IDs will come from the football API later —
 * these string IDs are stable placeholders that other mock data files
 * reference, so switching to real data later only means swapping this
 * file's contents (and the matching IDs in matches.ts/teams.ts).
 */
export const competitions = {
  premierLeague: { id: 'c-epl', name: 'Premier League', shortName: 'EPL', country: 'England' },
  laLiga: { id: 'c-laliga', name: 'La Liga', shortName: 'LALIGA', country: 'Spain' },
  bundesliga: { id: 'c-bundesliga', name: 'Bundesliga', shortName: 'BUN', country: 'Germany' },
  serieA: { id: 'c-seriea', name: 'Serie A', shortName: 'SERIE A', country: 'Italy' },
  ligue1: { id: 'c-ligue1', name: 'Ligue 1', shortName: 'L1', country: 'France' },
  championsLeague: {
    id: 'c-ucl',
    name: 'UEFA Champions League',
    shortName: 'UCL',
    country: 'Europe',
  },
  worldCup: { id: 'c-worldcup', name: 'FIFA World Cup', shortName: 'WORLD CUP', country: 'International' },
} as const satisfies Record<string, Competition>;

export const allCompetitions: Competition[] = Object.values(competitions);

/** Shown in the Home Screen's "Popular Leagues" row. */
export const popularCompetitions: Competition[] = [
  competitions.premierLeague,
  competitions.laLiga,
  competitions.bundesliga,
  competitions.serieA,
  competitions.championsLeague,
  competitions.worldCup,
];

export function getCompetitionById(id: string): Competition | undefined {
  return allCompetitions.find((competition) => competition.id === id);
}
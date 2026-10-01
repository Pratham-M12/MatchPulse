import { competitions } from '@/data/competitions';
import { teams } from '@/data/teams';
import type { Match } from '@/types/football';

const HOUR = 60 * 60 * 1000;

/**
 * Mock matches spanning every status the UI needs to handle: live,
 * scheduled (upcoming), and finished. Real API responses will map onto
 * this same `Match` shape later, so nothing that reads this file will
 * need to change when that happens — only this file gets replaced.
 */
export const matches: Match[] = [
  // --- Live ---
  {
    id: 'm-1',
    competition: competitions.championsLeague,
    homeTeam: teams.liverpool,
    awayTeam: teams.arsenal,
    homeScore: 2,
    awayScore: 1,
    status: 'live',
    minute: 78,
    kickoff: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
    venue: 'Anfield',
  },
  {
    id: 'm-2',
    competition: competitions.premierLeague,
    homeTeam: teams.manCity,
    awayTeam: teams.chelsea,
    homeScore: 3,
    awayScore: 2,
    status: 'live',
    minute: 64,
    kickoff: new Date(Date.now() - 64 * 60 * 1000).toISOString(),
    venue: 'Etihad Stadium',
  },
  {
    id: 'm-3',
    competition: competitions.bundesliga,
    homeTeam: teams.bayern,
    awayTeam: teams.dortmund,
    homeScore: 1,
    awayScore: 0,
    status: 'live',
    minute: 12,
    kickoff: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    venue: 'Allianz Arena',
  },

  // --- Scheduled / upcoming ---
  {
    id: 'm-4',
    competition: competitions.laLiga,
    homeTeam: teams.barcelona,
    awayTeam: teams.realMadrid,
    status: 'scheduled',
    kickoff: new Date(Date.now() + 3 * HOUR).toISOString(),
    venue: 'Camp Nou',
  },
  {
    id: 'm-5',
    competition: competitions.serieA,
    homeTeam: teams.juventus,
    awayTeam: teams.acMilan,
    status: 'scheduled',
    kickoff: new Date(Date.now() + 5 * HOUR).toISOString(),
    venue: 'Allianz Stadium',
  },
  {
    id: 'm-6',
    competition: competitions.ligue1,
    homeTeam: teams.psg,
    awayTeam: teams.marseille,
    status: 'scheduled',
    kickoff: new Date(Date.now() + 26 * HOUR).toISOString(),
    venue: 'Parc des Princes',
  },
  {
    id: 'm-7',
    competition: competitions.premierLeague,
    homeTeam: teams.manUnited,
    awayTeam: teams.tottenham,
    status: 'scheduled',
    kickoff: new Date(Date.now() + 30 * HOUR).toISOString(),
    venue: 'Old Trafford',
  },
  {
    id: 'm-8',
    competition: competitions.laLiga,
    homeTeam: teams.atleticoMadrid,
    awayTeam: teams.sevilla,
    status: 'scheduled',
    kickoff: new Date(Date.now() + 48 * HOUR).toISOString(),
    venue: 'Estadio Metropolitano',
  },
  {
    id: 'm-9',
    competition: competitions.worldCup,
    homeTeam: teams.brazil,
    awayTeam: teams.argentina,
    status: 'scheduled',
    kickoff: new Date(Date.now() + 72 * HOUR).toISOString(),
    venue: 'Maracana',
  },

  // --- Finished ---
  {
    id: 'm-10',
    competition: competitions.serieA,
    homeTeam: teams.interMilan,
    awayTeam: teams.napoli,
    homeScore: 2,
    awayScore: 2,
    status: 'finished',
    kickoff: new Date(Date.now() - 22 * HOUR).toISOString(),
    venue: 'San Siro',
  },
  {
    id: 'm-11',
    competition: competitions.bundesliga,
    homeTeam: teams.leipzig,
    awayTeam: teams.leverkusen,
    homeScore: 0,
    awayScore: 1,
    status: 'finished',
    kickoff: new Date(Date.now() - 25 * HOUR).toISOString(),
    venue: 'Red Bull Arena',
  },
  {
    id: 'm-12',
    competition: competitions.ligue1,
    homeTeam: teams.monaco,
    awayTeam: teams.lyon,
    homeScore: 3,
    awayScore: 1,
    status: 'finished',
    kickoff: new Date(Date.now() - 46 * HOUR).toISOString(),
    venue: 'Stade Louis II',
  },
];

export const liveMatches: Match[] = matches.filter((match) => match.status === 'live');
export const upcomingMatches: Match[] = matches.filter((match) => match.status === 'scheduled');
export const finishedMatches: Match[] = matches.filter((match) => match.status === 'finished');

/** The single match to spotlight in FeaturedMatchCard — the first live match, or the soonest upcoming one. */
export const featuredMatch: Match = liveMatches[0] ?? upcomingMatches[0] ?? matches[0];

export function getMatchById(id: string): Match | undefined {
  return matches.find((match) => match.id === id);
}

export function getMatchesByCompetition(competitionId: string): Match[] {
  return matches.filter((match) => match.competition.id === competitionId);
}

export function getMatchesByTeam(teamId: string): Match[] {
  return matches.filter((match) => match.homeTeam.id === teamId || match.awayTeam.id === teamId);
}
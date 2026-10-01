import { mapEventsToMatchEvents } from '@/lib/api/mappers/mapEvents';
import { mapLineup, mapSearchLeague, mapSquadPlayer, mapStandings, mapTeamInfo, mapTopScorer, mapPlayerProfile } from '@/lib/api/mappers/mapExtra';
import { mapFixtureToMatch, mapFixturesToMatches } from '@/lib/api/mappers/mapFixture';
import { mapStatisticsToMatchStats } from '@/lib/api/mappers/mapStatistics';
import { mapNewsArticles } from '@/lib/api/mappers/mapNews';
import { fetchFootballNews } from '@/lib/api/services/newsService';

import {
  resolveLeagueSeason,
  resolvePlayerSeason,
  resolveTeamSeason,
  type LeagueCoverageType,
} from '@/lib/api/seasonResolver';
import {
  fetchFixtureById,
  fetchFixtureEvents,
  fetchFixtureLineups,
  fetchFixturePredictions,
  fetchFixtureStatistics,
  fetchFixturesByDate,
  fetchFixturesByLeague,
  fetchFixturesByTeam,
  fetchLiveFixtures,
  fetchSquad,
  fetchStandings,
  fetchTeam,
  fetchTopScorers,
  fetchPlayer,
  searchLeagues,
  searchTeams,
} from '@/lib/api/services/fixturesService';
import type { Competition, LeagueTable, Match, MatchEvent, MatchLineup, MatchPrediction, MatchStats, NewsItem, Player, Team, TopScorer } from '@/types/football';

/**
 * Domain-facing football repository.
 * Screens and hooks call this - never the Axios client or DTOs.
 * A backend proxy can replace the service functions later without UI changes.
 */
export const footballRepository = {
  async liveMatches(): Promise<Match[]> {
    const { response } = await fetchLiveFixtures();
    return mapFixturesToMatches(response, { requireSupportedLeague: true });
  },

  async matchesByDate(date: string): Promise<Match[]> {
    const { response } = await fetchFixturesByDate(date);
    return mapFixturesToMatches(response, { requireSupportedLeague: true });
  },

  async matchById(fixtureId: string): Promise<Match | undefined> {
    const { response } = await fetchFixtureById(fixtureId);
    const fixture = response[0];
    return fixture ? mapFixtureToMatch(fixture, { requireSupportedLeague: false }) : undefined;
  },

  async matchesByTeam(teamId: string, season?: number): Promise<Match[]> {
    const targetSeason = season ?? (await resolveTeamSeason(teamId));
    const { response } = await fetchFixturesByTeam(teamId, targetSeason);
    return mapFixturesToMatches(response ?? [], { requireSupportedLeague: false });
  },

  async matchesByLeague(leagueId: number, season: number, from: string, to: string): Promise<Match[]> {
    const { response } = await fetchFixturesByLeague(leagueId, season, from, to);
    return mapFixturesToMatches(response, { requireSupportedLeague: false });
  },

  async events(fixtureId: string, homeTeamId: string): Promise<MatchEvent[]> {
    const { response } = await fetchFixtureEvents(fixtureId);
    return mapEventsToMatchEvents(response, homeTeamId);
  },

  async statistics(fixtureId: string, homeTeamId: string): Promise<MatchStats | undefined> {
    const { response } = await fetchFixtureStatistics(fixtureId);
    return mapStatisticsToMatchStats(response, homeTeamId);
  },

  async lineups(fixtureId: string): Promise<MatchLineup[]> {
    const { response } = await fetchFixtureLineups(fixtureId);
    return response.map(mapLineup);
  },

  async prediction(fixtureId: string): Promise<MatchPrediction | undefined> {
    const { response } = await fetchFixturePredictions(fixtureId);
    const item = response[0]?.predictions;
    if (!item) return undefined;
    return {
      winnerName: item.winner?.name ?? undefined,
      advice: item.advice ?? undefined,
      percentHome: item.percent?.home,
      percentDraw: item.percent?.draw,
      percentAway: item.percent?.away,
    };
  },

  async standings(leagueId: number, season: number): Promise<LeagueTable | null> {
    const response = await fetchStandings(leagueId, season);
    return mapStandings(response);
  },

  async team(teamId: string): Promise<Team | undefined> {
    const { response } = await fetchTeam(teamId);
    const info = response[0];
    return info ? mapTeamInfo(info) : undefined;
  },

  async squad(teamId: string): Promise<Player[]> {
    const { response } = await fetchSquad(teamId);
    const players = response[0]?.players ?? [];
    return players.map((player) => mapSquadPlayer(player, teamId));
  },

  async topScorers(leagueId: number, season: number): Promise<TopScorer[]> {
    const { response } = await fetchTopScorers(leagueId, season);
    return response.map(mapTopScorer).filter((item): item is TopScorer => item !== undefined);
  },

  async player(playerId: string, season?: number): Promise<{ player: Player; team?: Team } | undefined> {
    const targetSeason = season ?? (await resolvePlayerSeason(playerId));
    const response = await fetchPlayer(playerId, targetSeason);
    return mapPlayerProfile(response);
  },

  async resolveLeagueSeason(leagueId: number, coverage?: LeagueCoverageType): Promise<number> {
    return resolveLeagueSeason(leagueId, coverage);
  },

  async resolvePlayerSeason(playerId: string | number): Promise<number> {
    return resolvePlayerSeason(playerId);
  },

  async resolveTeamSeason(teamId: string | number): Promise<number> {
    return resolveTeamSeason(teamId);
  },

  async searchCatalog(query: string): Promise<{ teams: Team[]; leagues: Competition[] }> {
    const [teamsRes, leaguesRes] = await Promise.all([searchTeams(query), searchLeagues(query)]);
    return {
      teams: (teamsRes.response ?? []).slice(0, 8).map(mapTeamInfo),
      leagues: (leaguesRes.response ?? []).slice(0, 8).map(mapSearchLeague),
    };
  },

  async news(): Promise<NewsItem[]> {
    const data = await fetchFootballNews();
    return mapNewsArticles(data.response);
  },
};